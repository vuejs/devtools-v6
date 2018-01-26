import Vue from 'vue'

export const isChrome = typeof chrome !== 'undefined' && !!chrome.devtools
export const isWindows = navigator.platform.indexOf('Win') === 0
export const isMac = navigator.platform === 'MacIntel'
export const isLinux = navigator.platform.indexOf('Linux') === 0
export const keys = {
  ctrl: isMac ? '&#8984;' : 'Ctrl',
  shift: 'Shift',
  alt: isMac ? '&#8997;' : 'Alt',
  del: 'Del',
  enter: 'Enter',
  esc: 'Esc'
}

Object.defineProperties(Vue.prototype, {
  '$isChrome': { get: () => isChrome },
  '$isWindows': { get: () => isWindows },
  '$isMac': { get: () => isMac },
  '$isLinux': { get: () => isLinux },
  '$keys': { get: () => keys }
})

export function initBodyClass () {
  if (isWindows) document.body.classList.add('platform-windows')
  if (isMac) document.body.classList.add('platform-mac')
  if (isLinux) document.body.classList.add('platform-linux')
}
