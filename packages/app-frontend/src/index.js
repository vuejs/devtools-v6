import './assets/style/index.styl'

import './composition'
import { initStorage } from '@utils/storage'
import { createApp, connectApp } from './app'

const app = createApp()
app.$mount('#app')

/**
 * Create the main devtools app. Expects to be called with a shell interface
 * which implements a connect method.
 *
 * @param {Object} shell
 *        - connect(bridge => {})
 *        - onReload(reloadFn)
 */
export async function initDevTools (shell) {
  await initStorage()
  connectApp(app, shell)
  shell.onReload(() => {
    if (app) {
      app.$el.classList.add('disconnected')
      app.$destroy()
    }
    bridge.removeAllListeners()
    connectApp(app, shell)
  })
}
