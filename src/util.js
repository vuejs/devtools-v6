import path from 'path'

import CircularJSON from 'circular-json-es6'

import { instanceMap, getCustomInstanceDetails } from 'src/backend'
import { isVuexStore, getCustomStoreDetails } from 'src/backend/vuex'
import { isVueRouter, getCustomRouterDetails } from 'src/backend/router'

function cached (fn) {
  const cache = Object.create(null)
  return function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

var classifyRE = /(?:^|[-_/])(\w)/g
export const classify = cached((str) => {
  return str && str.replace(classifyRE, toUpper)
})

const camelizeRE = /-(\w)/g
export const camelize = cached((str) => {
  return str.replace(camelizeRE, toUpper)
})

function toUpper (_, c) {
  return c ? c.toUpperCase() : ''
}

export function inDoc (node) {
  if (!node) return false
  var doc = node.ownerDocument.documentElement
  var parent = node.parentNode
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
  'true': true,
  'false': false,
  'undefined': UNDEFINED,
  'null': null,
  '-Infinity': NEGATIVE_INFINITY,
  'Infinity': INFINITY,
  'NaN': NAN
}

export function stringify (data) {
  return CircularJSON.stringify(data, replacer)
}

function replacer (key) {
  const val = this[key]
  if (val === undefined) {
    return UNDEFINED
  } else if (val === Infinity) {
    return INFINITY
  } else if (val === -Infinity) {
    return NEGATIVE_INFINITY
  } else if (Number.isNaN(val)) {
    return NAN
  } else if (val instanceof RegExp) {
    // special handling of native type
    return `[native RegExp ${val.toString()}]`
  } else if (val instanceof Date) {
    return `[native Date ${val.toString()}]`
  } else if (isVuexStore(val)) {
    return getCustomStoreDetails(val)
  } else if (isVueRouter(val)) {
    return getCustomRouterDetails(val)
  } else if (val && val._isVue) {
    return getCustomInstanceDetails(val)
  } else if (isComponentDefinition(val)) {
    return getCustomComponentDefinitionDetails(val)
  } else {
    const type = typeof val
    if (type === 'function') {
      return getCustomFunctionDetails(val)
    }
  }
  return sanitize(val)
}

export function isComponentDefinition (val) {
  return val && typeof val.render === 'function'
}

// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
function basename (filename, ext) {
  return path.basename(
    filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'),
    ext
  )
}

export function getComponentName (options) {
  const name = options.name || options._componentTag
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
      tooltip: 'Component definition'
    }
  }
}

export function getCustomFunctionDetails (func) {
  const args = func.toString().match(/\(.*\)/)[0]
  return {
    _custom: {
      type: 'function',
      display: `<span>${func.name}</span>${args}`
    }
  }
}

export function parse (data, revive) {
  return revive
    ? CircularJSON.parse(data, reviver)
    : CircularJSON.parse(data)
}

const specialTypeRE = /^\[native (\w+) (.*)\]$/

function reviver (key, val) {
  if (val === UNDEFINED) {
    return undefined
  } else if (val === INFINITY) {
    return Infinity
  } else if (val === NEGATIVE_INFINITY) {
    return -Infinity
  } else if (val === NAN) {
    return NaN
  } else if (val && val._custom) {
    if (val._custom.type === 'component') {
      return instanceMap.get(val._custom.id)
    }
  } else if (specialTypeRE.test(val)) {
    const [, type, string] = specialTypeRE.exec(val)
    return new window[type](string)
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

export function searchDeepInObject (obj, searchTerm) {
  var match = false
  const keys = Object.keys(obj)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    const value = obj[key]
    if (compare(key, searchTerm) || compare(value, searchTerm)) {
      match = true
      break
    }
    if (isPlainObject(value)) {
      match = searchDeepInObject(value, searchTerm)
      if (match) {
        break
      }
    }
  }
  return match
}

function compare (mixedValue, stringValue) {
  if (Array.isArray(mixedValue) && searchInArray(mixedValue, stringValue.toLowerCase())) {
    return true
  }
  if (('' + mixedValue).toLowerCase().indexOf(stringValue.toLowerCase()) !== -1) {
    return true
  }
  return false
}

function searchInArray (arr, searchTerm) {
  let found = false
  for (let i = 0; i < arr.length; i++) {
    if (('' + arr[i]).toLowerCase().indexOf(searchTerm) !== -1) {
      found = true
      break
    }
  }
  return found
}

export function sortByKey (state) {
  return state && state.slice().sort((a, b) => {
    if (a.key < b.key) return -1
    if (a.key > b.key) return 1
    return 0
  })
}

export function set (object, path, value, cb = null) {
  const sections = path.split('.')
  while (sections.length > 1) {
    object = object[sections.shift()]
  }
  const field = sections[0]
  if (cb) {
    cb(object, field, value)
  } else {
    object[field] = value
  }
}

export function scrollIntoView (scrollParent, el) {
  const top = el.offsetTop
  const height = el.offsetHeight
  scrollParent.scrollTop = top + (height - scrollParent.offsetHeight) / 2
}
