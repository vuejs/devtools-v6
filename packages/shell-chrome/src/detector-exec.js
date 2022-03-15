import { installToast } from '@back/toast'

function sendMessage (message) {
  window.postMessage({
    key: '_vue-devtools-send-message',
    message,
  })
}

function detect () {
  setTimeout(() => {
    // Method 1: Check Nuxt.js
    const nuxtDetected = !!(window.__NUXT__ || window.$nuxt)

    if (nuxtDetected) {
      let Vue

      if (window.$nuxt) {
        Vue = window.$nuxt.$root && window.$nuxt.$root.constructor
      }

      sendMessage({
        devtoolsEnabled: (/* Vue 2 */ Vue && Vue.config.devtools) ||
          (/* Vue 3.2.14+ */ window.__VUE_DEVTOOLS_GLOBAL_HOOK__ && window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled),
        vueDetected: true,
        nuxtDetected: true,
      }, '*')

      return
    }

    // Method 2: Check  Vue 3
    const vueDetected = !!(window.__VUE__)
    if (vueDetected) {
      sendMessage({
        devtoolsEnabled: /* Vue 3.2.14+ */ window.__VUE_DEVTOOLS_GLOBAL_HOOK__ && window.__VUE_DEVTOOLS_GLOBAL_HOOK__.enabled,
        vueDetected: true,
      }, '*')

      return
    }

    // Method 3: Scan all elements inside document
    const all = document.querySelectorAll('*')
    let el
    for (let i = 0; i < all.length; i++) {
      if (all[i].__vue__) {
        el = all[i]
        break
      }
    }
    if (el) {
      let Vue = Object.getPrototypeOf(el.__vue__).constructor
      while (Vue.super) {
        Vue = Vue.super
      }
      sendMessage({
        devtoolsEnabled: Vue.config.devtools,
        vueDetected: true,
      }, '*')
    }
  }, 100)
}

// inject the hook
if (document instanceof HTMLDocument) {
  detect()
  installToast()
}
