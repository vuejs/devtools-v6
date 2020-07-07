import Vue from 'vue'
import PortalVue from 'portal-vue'
import VueUi, { generateHtmlIcon } from '@vue/ui'
import VueVirtualScroller from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import VI18n from './i18n'
import Responsive from './responsive'
import GlobalRefs from './global-refs'
import { keys } from '@utils/env'

export function setupPlugins () {
  Vue.use(PortalVue)
  Vue.use(VueUi)
  Vue.use(VueVirtualScroller)

  const currentLocale = 'en'
  const locales = require.context('../locales')
  const replacers = [
    { reg: /<input>/g, replace: '<span class="input-example">' },
    { reg: /<mono>/g, replace: '<span class="mono">' },
    { reg: /<\/(input|mono)>/g, replace: '</span>' },
    { reg: /\[\[(\S+)\]\]/g, replace: '<span class="keyboard">$1</span>' },
    { reg: /<<(\S+)>>/g, replace: (match, p1) => generateHtmlIcon(p1) }
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

  Vue.use(Responsive, {
    computed: {
      wide () {
        return this.width >= 1050
      },
      tall () {
        return this.height >= 350
      }
    }
  })

  Vue.use(GlobalRefs, {
    refs: {
      leftScroll: () => document.querySelector('.left .scroll'),
      leftRecycleList: () => document.querySelector('.left .vue-recycle-scroller'),
      rightScroll: () => document.querySelector('.right .scroll')
    }
  })
}
