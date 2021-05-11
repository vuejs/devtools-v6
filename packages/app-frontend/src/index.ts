import './assets/style/index.styl'

import './composition'
import { initStorage, Shell } from '@vue-devtools/shared-utils'
import { createApp, connectApp } from './app'
import { setAppConnected } from './features/connection'
import { getBridge } from './features/bridge'

/**
 * Create the main devtools app. Expects to be called with a shell interface
 * which implements a connect method.
 */
export async function initDevTools (shell: Shell) {
  await initStorage()
  const app = createApp()
  app.$mount('#app')
  connectApp(app, shell)
  shell.onReload(() => {
    setAppConnected(false)
    getBridge()?.removeAllListeners()
    connectApp(app, shell)
  })
}
