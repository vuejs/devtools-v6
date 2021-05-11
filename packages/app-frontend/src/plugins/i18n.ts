import { get } from '@utils/util'

const reg = /\{\{\s*([\w_.-]+)\s*\}\}/g

type StringMap = { [key: string]: string | StringMap }
type ValuesMap = { [key: string]: any }
type Replacer = (text: string) => string

let strings: StringMap
let defaultValues: ValuesMap
let replacer: Replacer

export function translate (path: string | string[], values: ValuesMap = {}) {
  values = Object.assign({}, defaultValues, values)
  let text = get(strings, path)
  text = text.replace(reg, (substring, matched) => {
    const value = get(values, matched)
    return typeof value !== 'undefined' ? value : substring
  })
  replacer && (text = replacer(text))
  return text
}

interface Options {
  strings: StringMap
  defaultValues: ValuesMap
  replacer: Replacer
}

export default {
  install (Vue, options: Options) {
    strings = options.strings || {}
    defaultValues = options.defaultValues || {}
    replacer = options.replacer
    Vue.prototype.$t = translate
  }
}
