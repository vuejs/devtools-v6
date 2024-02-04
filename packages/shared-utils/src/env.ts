import type { App } from 'vue'

export const isBrowser = typeof navigator !== 'undefined'
export const target: any = isBrowser
  ? window
  : typeof globalThis !== 'undefined'
    ? globalThis
    : {}
export const isChrome = typeof target.chrome !== 'undefined' && !!target.chrome.devtools
export const isFirefox = isBrowser && navigator.userAgent.includes('Firefox')
export const isWindows = isBrowser && navigator.platform.indexOf('Win') === 0
export const isMac = isBrowser && navigator.platform === 'MacIntel'
export const isLinux = isBrowser && navigator.platform.indexOf('Linux') === 0
export const keys = {
  ctrl: isMac ? '&#8984;' : 'Ctrl',
  shift: 'Shift',
  alt: isMac ? '&#8997;' : 'Alt',
  del: 'Del',
  enter: 'Enter',
  esc: 'Esc',
}

export function initEnv(app: App) {
  if (Object.prototype.hasOwnProperty.call(app.config.globalProperties, '$isChrome')) {
    return
  }

  Object.defineProperties(app.config.globalProperties, {
    $isChrome: { get: () => isChrome },
    $isFirefox: { get: () => isFirefox },
    $isWindows: { get: () => isWindows },
    $isMac: { get: () => isMac },
    $isLinux: { get: () => isLinux },
    $keys: { get: () => keys },
  })

  if (isWindows) {
    document.body.classList.add('platform-windows')
  }
  if (isMac) {
    document.body.classList.add('platform-mac')
  }
  if (isLinux) {
    document.body.classList.add('platform-linux')
  }
}
