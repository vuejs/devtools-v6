import path from 'path'
import { CustomState } from '@vue/devtools-api'
import { stringifyCircularAutoChunks, parseCircularAutoChunks } from './transfer'
import {
  getInstanceMap,
  getCustomInstanceDetails,
  getCustomRouterDetails,
  getCustomStoreDetails,
  isVueInstance,
  getCustomObjectDetails,
} from './backend'
import { SharedData } from './shared-data'
import { isChrome, target } from './env'

function cached (fn) {
  const cache = Object.create(null)
  return function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

const classifyRE = /(?:^|[-_/])(\w)/g
export const classify = cached((str) => {
  // fix: str.replace may causes '"replace" is not a function' exception.
  // This bug may causes the UI 'Component Filter' to not work properly
  // e.g. The type of 'str' is Number.
  // So need cover 'str' to String.
  return str && ('' + str).replace(classifyRE, toUpper)
})

const camelizeRE = /-(\w)/g
export const camelize = cached((str) => {
  return str && str.replace(camelizeRE, toUpper)
})

const kebabizeRE = /([a-z0-9])([A-Z])/g
export const kebabize = cached((str) => {
  return str && str
    .replace(kebabizeRE, (_, lowerCaseCharacter, upperCaseLetter) => {
      return `${lowerCaseCharacter}-${upperCaseLetter}`
    })
    .toLowerCase()
})

function toUpper (_, c) {
  return c ? c.toUpperCase() : ''
}

export function getComponentDisplayName (originalName, style = 'class') {
  switch (style) {
    case 'class':
      return classify(originalName)
    case 'kebab':
      return kebabize(originalName)
    case 'original':
    default:
      return originalName
  }
}

export function inDoc (node) {
  if (!node) return false
  const doc = node.ownerDocument.documentElement
  const parent = node.parentNode
  return doc === node ||
    doc === parent ||
    !!(parent && parent.nodeType === 1 && (doc.contains(parent)))
}

/**
 * Stringify/parse data using CircularJSON.
 */

export const UNDEFINED = '__vue_devtool_undefined__'
export const INFINITY = '__vue_devtool_infinity__'
export const NEGATIVE_INFINITY = '__vue_devtool_negative_infinity__'
export const NAN = '__vue_devtool_nan__'

export const SPECIAL_TOKENS = {
  true: true,
  false: false,
  undefined: UNDEFINED,
  null: null,
  '-Infinity': NEGATIVE_INFINITY,
  Infinity: INFINITY,
  NaN: NAN,
}

export const MAX_STRING_SIZE = 10000
export const MAX_ARRAY_SIZE = 5000

export function specialTokenToString (value) {
  if (value === null) {
    return 'null'
  } else if (value === UNDEFINED) {
    return 'undefined'
  } else if (value === NAN) {
    return 'NaN'
  } else if (value === INFINITY) {
    return 'Infinity'
  } else if (value === NEGATIVE_INFINITY) {
    return '-Infinity'
  }
  return false
}

/**
 * Needed to prevent stack overflow
 * while replacing complex objects
 * like components because we create
 * new objects with the CustomValue API
 * (.i.e `{ _custom: { ... } }`)
 */
class EncodeCache {
  map: Map<any, any>

  constructor () {
    this.map = new Map()
  }

  /**
   * Returns a result unique to each input data
   * @param {*} data Input data
   * @param {*} factory Function used to create the unique result
   */
  cache<TResult, TData> (data: TData, factory: (data: TData) => TResult): TResult {
    const cached: TResult = this.map.get(data)
    if (cached) {
      return cached
    } else {
      const result = factory(data)
      this.map.set(data, result)
      return result
    }
  }

  clear () {
    this.map.clear()
  }
}

const encodeCache = new EncodeCache()

class ReviveCache {
  map: Map<number, any>
  index: number
  size: number
  maxSize: number

  constructor (maxSize: number) {
    this.maxSize = maxSize
    this.map = new Map()
    this.index = 0
    this.size = 0
  }

  cache (value: any) {
    const currentIndex = this.index
    this.map.set(currentIndex, value)
    this.size++
    if (this.size > this.maxSize) {
      this.map.delete(currentIndex - this.size)
      this.size--
    }
    this.index++
    return currentIndex
  }

  read (id: number) {
    return this.map.get(id)
  }
}

const reviveCache = new ReviveCache(1000)

const replacers = {
  internal: replacerForInternal,
  user: replaceForUser,
}

export function stringify (data, target: keyof typeof replacers = 'internal') {
  // Create a fresh cache for each serialization
  encodeCache.clear()
  return stringifyCircularAutoChunks(data, replacers[target])
}

function replacerForInternal (key) {
  // @ts-ignore
  const val = this[key]
  const type = typeof val
  if (Array.isArray(val)) {
    const l = val.length
    if (l > MAX_ARRAY_SIZE) {
      return {
        _isArray: true,
        length: l,
        items: val.slice(0, MAX_ARRAY_SIZE),
      }
    }
    return val
  } else if (typeof val === 'string') {
    if (val.length > MAX_STRING_SIZE) {
      return val.substring(0, MAX_STRING_SIZE) + `... (${(val.length)} total length)`
    } else {
      return val
    }
  } else if (type === 'undefined') {
    return UNDEFINED
  } else if (val === Infinity) {
    return INFINITY
  } else if (val === -Infinity) {
    return NEGATIVE_INFINITY
  } else if (type === 'function') {
    return getCustomFunctionDetails(val)
  } else if (type === 'symbol') {
    return `[native Symbol ${Symbol.prototype.toString.call(val)}]`
  } else if (type === 'bigint') {
    return getCustomBigIntDetails(val)
  } else if (val !== null && type === 'object') {
    const proto = Object.prototype.toString.call(val)
    if (proto === '[object Map]') {
      return encodeCache.cache(val, () => getCustomMapDetails(val))
    } else if (proto === '[object Set]') {
      return encodeCache.cache(val, () => getCustomSetDetails(val))
    } else if (proto === '[object RegExp]') {
      // special handling of native type
      return `[native RegExp ${RegExp.prototype.toString.call(val)}]`
    } else if (proto === '[object Date]') {
      return `[native Date ${Date.prototype.toString.call(val)}]`
    } else if (proto === '[object Error]') {
      return `[native Error ${val.message}<>${val.stack}]`
    } else if (val.state && val._vm) {
      return encodeCache.cache(val, () => getCustomStoreDetails(val))
    } else if (val.constructor && val.constructor.name === 'VueRouter') {
      return encodeCache.cache(val, () => getCustomRouterDetails(val))
    } else if (isVueInstance(val)) {
      return encodeCache.cache(val, () => getCustomInstanceDetails(val))
    } else if (typeof val.render === 'function') {
      return encodeCache.cache(val, () => getCustomComponentDefinitionDetails(val))
    } else if (val.constructor && val.constructor.name === 'VNode') {
      return `[native VNode <${val.tag}>]`
    } else if (typeof HTMLElement !== 'undefined' && val instanceof HTMLElement) {
      return encodeCache.cache(val, () => getCustomHTMLElementDetails(val))
    } else if (val.constructor?.name === 'Store' && val._wrappedGetters) {
      return `[object Store]`
    } else if (val.currentRoute) {
      return `[object Router]`
    }
    const customDetails = getCustomObjectDetails(val, proto)
    if (customDetails != null) return customDetails
  } else if (Number.isNaN(val)) {
    return NAN
  }
  return sanitize(val)
}

// @TODO revive from backend to have more data to the clipboard
function replaceForUser (key) {
  // @ts-ignore
  let val = this[key]
  const type = typeof val
  if (val?._custom && 'value' in val._custom) {
    val = val._custom.value
  }
  if (type !== 'object') {
    if (val === UNDEFINED) {
      return undefined
    } else if (val === INFINITY) {
      return Infinity
    } else if (val === NEGATIVE_INFINITY) {
      return -Infinity
    } else if (val === NAN) {
      return NaN
    }
    return val
  }
  return sanitize(val)
}

export function getCustomMapDetails (val) {
  const list = []
  val.forEach(
    (value, key) => list.push({
      key,
      value,
    }),
  )
  return {
    _custom: {
      type: 'map',
      display: 'Map',
      value: list,
      readOnly: true,
      fields: {
        abstract: true,
      },
    },
  }
}

export function reviveMap (val) {
  const result = new Map()
  const list = val._custom.value
  for (let i = 0; i < list.length; i++) {
    const { key, value } = list[i]
    result.set(key, revive(value))
  }
  return result
}

export function getCustomSetDetails (val) {
  const list = Array.from(val)
  return {
    _custom: {
      type: 'set',
      display: `Set[${list.length}]`,
      value: list,
      readOnly: true,
    },
  }
}

export function reviveSet (val) {
  const result = new Set()
  const list = val._custom.value
  for (let i = 0; i < list.length; i++) {
    const value = list[i]
    result.add(revive(value))
  }
  return result
}

export function getCustomBigIntDetails (val) {
  const stringifiedBigInt = BigInt.prototype.toString.call(val)
  return {
    _custom: {
      type: 'bigint',
      display: `BigInt(${stringifiedBigInt})`,
      value: stringifiedBigInt,
    },
  }
}

// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
function basename (filename, ext) {
  return path.basename(
    filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'),
    ext,
  )
}

export function getComponentName (options) {
  const name = options.displayName || options.name || options._componentTag
  if (name) {
    return name
  }
  const file = options.__file // injected by vue-loader
  if (file) {
    return classify(basename(file, '.vue'))
  }
}

export function getCustomComponentDefinitionDetails (def) {
  let display = getComponentName(def)
  if (display) {
    if (def.name && def.__file) {
      display += ` <span>(${def.__file})</span>`
    }
  } else {
    display = '<i>Unknown Component</i>'
  }
  return {
    _custom: {
      type: 'component-definition',
      display,
      tooltip: 'Component definition',
      ...def.__file
        ? {
            file: def.__file,
          }
        : {},
    },
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function getCustomFunctionDetails (func: Function): CustomState {
  let string = ''
  let matches = null
  try {
    string = Function.prototype.toString.call(func)
    matches = String.prototype.match.call(string, /\([\s\S]*?\)/)
  } catch (e) {
    // Func is probably a Proxy, which can break Function.prototype.toString()
  }
  // Trim any excess whitespace from the argument string
  const match = matches && matches[0]
  const args = typeof match === 'string'
    ? match
    : '(?)'
  const name = typeof func.name === 'string' ? func.name : ''
  return {
    _custom: {
      type: 'function',
      display: `<span style="opacity:.5;">function</span> ${escape(name)}${args}`,
      tooltip: string.trim() ? `<pre>${string}</pre>` : null,
      _reviveId: reviveCache.cache(func),
    },
  }
}

export function getCustomHTMLElementDetails (value: HTMLElement): CustomState {
  try {
    return {
      _custom: {
        type: 'HTMLElement',
        display: `<span class="opacity-30">&lt;</span><span class="text-blue-500">${value.tagName.toLowerCase()}</span><span class="opacity-30">&gt;</span>`,
        value: namedNodeMapToObject(value.attributes),
        actions: [
          {
            icon: 'input',
            tooltip: 'Log element to console',
            action: () => {
              // eslint-disable-next-line no-console
              console.log(value)
            },
          },
        ],
      },
    }
  } catch (e) {
    return {
      _custom: {
        type: 'HTMLElement',
        display: `<span class="text-blue-500">${String(value)}</span>`,
      },
    }
  }
}

function namedNodeMapToObject (map: NamedNodeMap) {
  const result: any = {}
  const l = map.length
  for (let i = 0; i < l; i++) {
    const node = map.item(i)
    result[node.name] = node.value
  }
  return result
}

export function getCustomRefDetails (instance, key, ref) {
  let value
  if (Array.isArray(ref)) {
    value = ref.map((r) => getCustomRefDetails(instance, key, r)).map(data => data.value)
  } else {
    let name
    if (ref._isVue) {
      name = getComponentName(ref.$options)
    } else {
      name = ref.tagName.toLowerCase()
    }

    value = {
      _custom: {
        display: `&lt;${name}` +
          (ref.id ? ` <span class="attr-title">id</span>="${ref.id}"` : '') +
          (ref.className ? ` <span class="attr-title">class</span>="${ref.className}"` : '') + '&gt;',
        uid: instance.__VUE_DEVTOOLS_UID__,
        type: 'reference',
      },
    }
  }
  return {
    type: '$refs',
    key: key,
    value,
    editable: false,
  }
}

export function parse (data: any, revive = false) {
  return revive
    ? parseCircularAutoChunks(data, reviver)
    : parseCircularAutoChunks(data)
}

const specialTypeRE = /^\[native (\w+) (.*?)(<>((.|\s)*))?\]$/
const symbolRE = /^\[native Symbol Symbol\((.*)\)\]$/

function reviver (key, val) {
  return revive(val)
}

export function revive (val) {
  if (val === UNDEFINED) {
    return undefined
  } else if (val === INFINITY) {
    return Infinity
  } else if (val === NEGATIVE_INFINITY) {
    return -Infinity
  } else if (val === NAN) {
    return NaN
  } else if (val && val._custom) {
    const { _custom: custom }: CustomState = val
    if (custom.type === 'component') {
      return getInstanceMap().get(custom.id)
    } else if (custom.type === 'map') {
      return reviveMap(val)
    } else if (custom.type === 'set') {
      return reviveSet(val)
    } else if (custom.type === 'bigint') {
      return BigInt(custom.value)
    } else if (custom._reviveId) {
      return reviveCache.read(custom._reviveId)
    } else {
      return revive(custom.value)
    }
  } else if (symbolRE.test(val)) {
    const [, string] = symbolRE.exec(val)
    return Symbol.for(string)
  } else if (specialTypeRE.test(val)) {
    const [, type, string,, details] = specialTypeRE.exec(val)
    const result = new target[type](string)
    if (type === 'Error' && details) {
      result.stack = details
    }
    return result
  } else {
    return val
  }
}

/**
 * Sanitize data to be posted to the other side.
 * Since the message posted is sent with structured clone,
 * we need to filter out any types that might cause an error.
 *
 * @param {*} data
 * @return {*}
 */

function sanitize (data) {
  if (
    !isPrimitive(data) &&
    !Array.isArray(data) &&
    !isPlainObject(data)
  ) {
    // handle types that will probably cause issues in
    // the structured clone
    return Object.prototype.toString.call(data)
  } else {
    return data
  }
}

export function isPlainObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

function isPrimitive (data) {
  if (data == null) {
    return true
  }
  const type = typeof data
  return (
    type === 'string' ||
    type === 'number' ||
    type === 'boolean'
  )
}

/**
 * Searches a key or value in the object, with a maximum deepness
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
export function searchDeepInObject (obj, searchTerm) {
  const seen = new Map()
  const result = internalSearchObject(obj, searchTerm.toLowerCase(), seen, 0)
  seen.clear()
  return result
}

const SEARCH_MAX_DEPTH = 10

/**
 * Executes a search on each field of the provided object
 * @param {*} obj Search target
 * @param {string} searchTerm Search string
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchObject (obj, searchTerm, seen, depth) {
  if (depth > SEARCH_MAX_DEPTH) {
    return false
  }
  let match = false
  const keys = Object.keys(obj)
  let key, value
  for (let i = 0; i < keys.length; i++) {
    key = keys[i]
    value = obj[key]
    match = internalSearchCheck(searchTerm, key, value, seen, depth + 1)
    if (match) {
      break
    }
  }
  return match
}

/**
 * Executes a search on each value of the provided array
 * @param {*} array Search target
 * @param {string} searchTerm Search string
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchArray (array, searchTerm, seen, depth) {
  if (depth > SEARCH_MAX_DEPTH) {
    return false
  }
  let match = false
  let value
  for (let i = 0; i < array.length; i++) {
    value = array[i]
    match = internalSearchCheck(searchTerm, null, value, seen, depth + 1)
    if (match) {
      break
    }
  }
  return match
}

/**
 * Checks if the provided field matches the search terms
 * @param {string} searchTerm Search string
 * @param {string} key Field key (null if from array)
 * @param {*} value Field value
 * @param {Map<any,boolean>} seen Map containing the search result to prevent stack overflow by walking on the same object multiple times
 * @param {number} depth Deep search depth level, which is capped to prevent performance issues
 * @returns {boolean} Search match
 */
function internalSearchCheck (searchTerm, key, value, seen, depth) {
  let match = false
  let result
  if (key === '_custom') {
    key = value.display
    value = value.value
  }
  (result = specialTokenToString(value)) && (value = result)
  if (key && compare(key, searchTerm)) {
    match = true
    seen.set(value, true)
  } else if (seen.has(value)) {
    match = seen.get(value)
  } else if (Array.isArray(value)) {
    seen.set(value, null)
    match = internalSearchArray(value, searchTerm, seen, depth)
    seen.set(value, match)
  } else if (isPlainObject(value)) {
    seen.set(value, null)
    match = internalSearchObject(value, searchTerm, seen, depth)
    seen.set(value, match)
  } else if (compare(value, searchTerm)) {
    match = true
    seen.set(value, true)
  }
  return match
}

/**
 * Compares two values
 * @param {*} value Mixed type value that will be cast to string
 * @param {string} searchTerm Search string
 * @returns {boolean} Search match
 */
function compare (value, searchTerm) {
  return ('' + value).toLowerCase().indexOf(searchTerm) !== -1
}

export function sortByKey (state) {
  return state && state.slice().sort((a, b) => {
    if (a.key < b.key) return -1
    if (a.key > b.key) return 1
    return 0
  })
}

export function simpleGet (object, path) {
  const sections = Array.isArray(path) ? path : path.split('.')
  for (let i = 0; i < sections.length; i++) {
    object = object[sections[i]]
    if (!object) {
      return undefined
    }
  }
  return object
}

export function focusInput (el) {
  el.focus()
  el.setSelectionRange(0, el.value.length)
}

export function openInEditor (file) {
  // Console display
  const fileName = file.replace(/\\/g, '\\\\')
  const src = `fetch('${SharedData.openInEditorHost}__open-in-editor?file=${encodeURI(file)}').then(response => {
    if (response.ok) {
      console.log('File ${fileName} opened in editor')
    } else {
      const msg = 'Opening component ${fileName} failed'
      const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}
      if (target.__VUE_DEVTOOLS_TOAST__) {
        target.__VUE_DEVTOOLS_TOAST__(msg, 'error')
      } else {
        console.log('%c' + msg, 'color:red')
      }
      console.log('Check the setup of your project, see https://devtools.vuejs.org/guide/open-in-editor.html')
    }
  })`
  if (isChrome) {
    target.chrome.devtools.inspectedWindow.eval(src)
  } else {
    // eslint-disable-next-line no-eval
    eval(src)
  }
}

const ESC = {
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '&': '&amp;',
}

export function escape (s) {
  return s.replace(/[<>"&]/g, escapeChar)
}

function escapeChar (a) {
  return ESC[a] || a
}

export function copyToClipboard (state) {
  let text: string

  if (typeof state !== 'object') {
    text = String(state)
  } else {
    text = stringify(state, 'user')
  }

  // @TODO navigator.clipboard is buggy in extensions
  if (typeof document === 'undefined') return
  const dummyTextArea = document.createElement('textarea')
  dummyTextArea.textContent = text
  document.body.appendChild(dummyTextArea)
  dummyTextArea.select()
  document.execCommand('copy')
  document.body.removeChild(dummyTextArea)
}

export function isEmptyObject (obj) {
  return obj === UNDEFINED || !obj || Object.keys(obj).length === 0
}
