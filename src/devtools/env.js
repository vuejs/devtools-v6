import Vue from 'vue'

// Env

export const isChrome = typeof chrome !== 'undefined' && !!chrome.devtools
export const isMac = navigator.platform === 'MacIntel'
export const keys = {
  ctrl: isMac ? '&#8984;' : 'Ctrl',
  shift: 'Shift',
  alt: isMac ? '&#8997;' : 'Alt'
}

Object.defineProperties(Vue.prototype, {
  '$isChrome': { get: () => isChrome },
  '$isMac': { get: () => isMac },
  '$keys': { get: () => keys }
})
