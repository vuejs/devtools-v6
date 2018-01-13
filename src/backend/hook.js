import { findRelatedComponent } from './utils'

// this script is injected into every page.

/**
 * Install the hook on window, which is an event emitter.
 * Note because Chrome content scripts cannot directly modify the window object,
 * we are evaling this function by inserting a script tag. That's why we have
 * to inline the whole event emitter implementation here.
 *
 * @param {Window} window
 */

export function installHook (window) {
  let listeners = {}

  const hook = {
    Vue: null,

    on (event, fn) {
      event = '$' + event
      ;(listeners[event] || (listeners[event] = [])).push(fn)
    },

    once (event, fn) {
      const eventAlias = event
      event = '$' + event
      function on () {
        this.off(eventAlias, on)
        fn.apply(this, arguments)
      }
      ;(listeners[event] || (listeners[event] = [])).push(on)
    },

    off (event, fn) {
      event = '$' + event
      if (!arguments.length) {
        listeners = {}
      } else {
        const cbs = listeners[event]
        if (cbs) {
          if (!fn) {
            listeners[event] = null
          } else {
            for (let i = 0, l = cbs.length; i < l; i++) {
              const cb = cbs[i]
              if (cb === fn || cb.fn === fn) {
                cbs.splice(i, 1)
                break
              }
            }
          }
        }
      }
    },

    emit (event) {
      event = '$' + event
      let cbs = listeners[event]
      if (cbs) {
        const args = [].slice.call(arguments, 1)
        cbs = cbs.slice()
        for (let i = 0, l = cbs.length; i < l; i++) {
          cbs[i].apply(this, args)
        }
      }
    }
  }

  hook.once('init', Vue => {
    hook.Vue = Vue

    Vue.prototype.$inspect = function () {
      const fn = window.__VUE_DEVTOOLS_INSPECT__
      fn && fn(this)
    }
  })

  hook.once('vuex:init', store => {
    hook.store = store
  })

  Object.defineProperty(window, '__VUE_DEVTOOLS_GLOBAL_HOOK__', {
    get () {
      return hook
    }
  })

  // Start recording context menu when Vue is detected
  // event if Vue devtools are not loaded yet
  document.addEventListener('contextmenu', event => {
    const el = event.target
    if (el) {
      // Search for parent that "is" a component instance
      const instance = findRelatedComponent(el)
      if (instance) {
        window.__VUE_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__ = true
        window.__VUE_DEVTOOLS_CONTEXT_MENU_TARGET__ = instance
        return
      }
    }
    window.__VUE_DEVTOOLS_CONTEXT_MENU_HAS_TARGET__ = null
    window.__VUE_DEVTOOLS_CONTEXT_MENU_TARGET__ = null
  })
}
