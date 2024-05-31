import { simpleGet } from '@vue-devtools/shared-utils'
import type { Plugin } from 'vue'

const reg = /\{\{\s*([\w.-]+)\s*\}\}/g

interface StringMap { [key: string]: string | StringMap }
interface ValuesMap { [key: string]: any }
type Replacer = (text: string) => string

let strings: StringMap
let defaultValues: ValuesMap
let replacer: Replacer

export function translate(path: string | string[], values: ValuesMap = {}) {
  values = Object.assign({}, defaultValues, values)
  let text = simpleGet(strings, path)
  text = text.replace(reg, (substring, matched) => {
    const value = simpleGet(values, matched)
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
  install(app, options: Options) {
    strings = options.strings || {}
    defaultValues = options.defaultValues || {}
    replacer = options.replacer
    app.config.globalProperties.$t = translate
  },
} as Plugin
