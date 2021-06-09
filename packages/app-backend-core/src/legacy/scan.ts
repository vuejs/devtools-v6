import { isBrowser, target } from '@vue-devtools/shared-utils'

const rootInstances = []
let rootUID = 0

/**
 * Scan the page for root level Vue instances.
 */
export function scan () {
  rootInstances.length = 0

  let inFragment = false
  let currentFragment = null

  // eslint-disable-next-line no-inner-declarations
  function processInstance (instance) {
    if (instance) {
      if (rootInstances.indexOf(instance.$root) === -1) {
        instance = instance.$root
      }
      if (instance._isFragment) {
        inFragment = true
        currentFragment = instance
      }

      // respect Vue.config.devtools option
      let baseVue = instance.constructor
      while (baseVue.super) {
        baseVue = baseVue.super
      }
      if (baseVue.config && baseVue.config.devtools) {
        // give a unique id to root instance so we can
        // 'namespace' its children
        if (typeof instance.__VUE_DEVTOOLS_ROOT_UID__ === 'undefined') {
          instance.__VUE_DEVTOOLS_ROOT_UID__ = ++rootUID
        }
        rootInstances.push(instance)
      }

      return true
    }
  }

  if (isBrowser) {
    const walkDocument = document => {
      walk(document, function (node) {
        if (inFragment) {
          if (node === currentFragment._fragmentEnd) {
            inFragment = false
            currentFragment = null
          }
          return true
        }
        const instance = node.__vue__

        return processInstance(instance)
      })
    }
    walkDocument(document)

    const iframes = document.querySelectorAll<HTMLIFrameElement>('iframe')
    for (const iframe of iframes) {
      try {
        walkDocument(iframe.contentDocument)
      } catch (e) {
        // Ignore
      }
    }
  } else {
    if (Array.isArray(target.__VUE_ROOT_INSTANCES__)) {
      target.__VUE_ROOT_INSTANCES__.map(processInstance)
    }
  }

  return rootInstances
}

/**
 * DOM walk helper
 *
 * @param {NodeList} nodes
 * @param {Function} fn
 */

function walk (node, fn) {
  if (node.childNodes) {
    for (let i = 0, l = node.childNodes.length; i < l; i++) {
      const child = node.childNodes[i]
      const stop = fn(child)
      if (!stop) {
        walk(child, fn)
      }
    }
  }

  // also walk shadow DOM
  if (node.shadowRoot) {
    walk(node.shadowRoot, fn)
  }
}
