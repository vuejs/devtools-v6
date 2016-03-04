import CircularJSON from 'circular-json'

/**
 * Stringify data using CircularJSON.
 *
 * @param {*} data
 * @return {String}
 */

export function stringify (data) {
  return CircularJSON.stringify(data, (key, val) => sanitize(val))
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

function isPlainObject (obj) {
  return Object.prototype.toString.call(obj) === '[object Object]'
}

var primitiveTypeRE = /^(string|number|boolean)$/
function isPrimitive (data) {
  return data == null ||
    primitiveTypeRE.test(typeof data) ||
    data instanceof RegExp
}
