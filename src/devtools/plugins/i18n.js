import { get } from 'src/util'

const reg = /\{\{\s*([\w_.-]+)\s*\}\}/g

let strings
let defaultValues
let replacer

export function translate (path, values = {}) {
  values = Object.assign({}, defaultValues, values)
  let text = get(strings, path)
  text = text.replace(reg, (substring, matched) => {
    const value = get(values, matched)
    return typeof value !== 'undefined' ? value : substring
  })
  replacer && (text = replacer(text))
  return text
}

export default {
  install (Vue, options) {
    strings = options.strings || {}
    defaultValues = options.defaultValues || {}
    replacer = options.replacer
    Vue.prototype.$t = translate
  }
}
