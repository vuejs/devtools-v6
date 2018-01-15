import Vue from 'vue'
import VTooltip from 'v-tooltip'
import VI18n from './plugins/i18n'
import { keys } from './env'

Vue.use(VTooltip, {
  defaultDelay: {
    show: 600,
    hide: 0
  },
  defaultOffset: 2
})

const currentLocale = 'en'
const locales = require.context('./locales')
const keyboardReg = /\[(\w+)\]/g
const iconReg = /\|(\w+)\|/g
Vue.use(VI18n, {
  strings: locales(`./${currentLocale}`).default,
  defaultValues: {
    keys
  },
  replacer: text => {
    text = text.replace(keyboardReg, '<span class="keyboard">$1</span>')
    text = text.replace(iconReg, '<i class="material-icons">$1</i>')
    return text
  }
})
