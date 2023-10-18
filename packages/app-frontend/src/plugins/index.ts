import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import 'vue-resize/dist/vue-resize.css'

import { App } from 'vue'
import VueUi, { generateHtmlIcon } from '../features/components/ui'
import VueVirtualScroller from 'vue-virtual-scroller'
import { keys } from '@vue-devtools/shared-utils'
import PortalVue from 'portal-vue'
import VI18n from './i18n'
import Responsive from './responsive'
import GlobalRefs from './global-refs'
import VueResize from 'vue-resize'

export function setupPlugins (app: App) {
  app.use(PortalVue)
  app.use(VueUi)
  app.use(VueResize)
  app.use(VueVirtualScroller)

  const currentLocale = 'en'
  const locales = require.context('../locales')
  const replacers = [
    { reg: /<input>/g, replace: '<span class="input-example">' },
    { reg: /<mono>/g, replace: '<span class="mono">' },
    { reg: /<\/(input|mono)>/g, replace: '</span>' },
    { reg: /\[\[(\S+)\]\]/g, replace: '<span class="keyboard">$1</span>' },
    { reg: /<<(\S+)>>/g, replace: (_, p1) => generateHtmlIcon(p1) as string },
  ]

  app.use(VI18n, {
    strings: locales(`./${currentLocale}`).default,
    defaultValues: {
      keys,
    },
    replacer: (text: string) => {
      for (const replacer of replacers) {
        // @ts-ignore
        text = text.replace(replacer.reg, replacer.replace)
      }
      return text
    },
  })

  app.use(Responsive)

  app.use(GlobalRefs, {
    refs: {
      leftScroll: () => document.querySelector('.left .scroll'),
      leftRecycleList: () => document.querySelector('.left .vue-recycle-scroller'),
      rightScroll: () => document.querySelector('.right .scroll'),
    },
  })
}
