import './assets/style/index.styl'

import './composition'
import { initStorage } from '@utils/storage'
import { createApp, connectApp } from './app'
import { setAppConnected } from './features/connection'

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
  const app = createApp()
  app.$mount('#app')
  connectApp(app, shell)
  shell.onReload(() => {
    setAppConnected(false)
    bridge.removeAllListeners()
    connectApp(app, shell)
  })
}
