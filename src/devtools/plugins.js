import Vue from 'vue'
import { keys } from './env'
import VTooltip from 'v-tooltip'
import VI18n from './plugins/i18n'
import GlobalRefs from './plugins/global-refs'

Vue.use(VTooltip, {
  defaultDelay: {
    show: 600,
    hide: 0
  },
  defaultOffset: 2,
  defaultBoundariesElement: document.body,
  popover: {
    defaultHandleResize: false
  }
})

const currentLocale = 'en'
const locales = require.context('./locales')
const replacers = [
  { reg: /\<input\>/g, replace: '<span class="input-example">' },
  { reg: /\<\/input\>/g, replace: '</span>' },
  { reg: /\[\[(\S+)\]\]/g, replace: '<span class="keyboard">$1</span>' },
  { reg: /\<\<(\S+)\>\>/g, replace: '<i class="material-icons">$1</i>' }
]
Vue.use(VI18n, {
  strings: locales(`./${currentLocale}`).default,
  defaultValues: {
    keys
  },
  replacer: text => {
    for (const replacer of replacers) {
      text = text.replace(replacer.reg, replacer.replace)
    }
    return text
  }
})

Vue.use(GlobalRefs, {
  refs: {
    leftScroll: () => document.querySelector('.left .scroll'),
    rightScroll: () => document.querySelector('.right .scroll')
  }
})
