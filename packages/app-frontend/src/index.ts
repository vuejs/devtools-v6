import './assets/style/index.styl'
import './assets/style/index.postcss'

import type { Shell } from '@vue-devtools/shared-utils'
import { initStorage } from '@vue-devtools/shared-utils'
import { connectApp, createApp } from './app'
import { setAppConnected } from './features/connection'
import { getBridge } from './features/bridge'

export { setAppConnected } from './features/connection'

/**
 * Create the main devtools app. Expects to be called with a shell interface
 * which implements a connect method.
 */
export async function initDevTools(shell: Shell) {
  await initStorage()
  const app = createApp()
  app.mount('#app')
  connectApp(app, shell)
  shell.onReload(() => {
    setAppConnected(false, true, true)
    getBridge()?.removeAllListeners()
    connectApp(app, shell)
  })
}
