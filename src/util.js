import CircularJSON from 'circular-json-es6'

function cached (fn) {
  const cache = Object.create(null)
  return function cachedFn (str) {
    const hit = cache[str]
    return hit || (cache[str] = fn(str))
  }
}

var classifyRE = /(?:^|[-_\/])(\w)/g
export const classify = cached((str) => {
  return str.replace(classifyRE, toUpper)
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

export function stringify (data) {
  return CircularJSON.stringify(data, replacer)
}

function replacer (key, val) {
  if (val === undefined) {
    return UNDEFINED
  } else {
    return sanitize(val)
  }
}

export function parse (data) {
  return CircularJSON.parse(data)
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
    type === 'boolean' ||
    data instanceof RegExp
  )
}
