export const backendInjections = {
  instanceMap: null,
  getCustomInstanceDetails: null
}

export function getInstanceMap () {
  return backendInjections.instanceMap
}

export function getCustomInstanceDetails (instance) {
  return backendInjections.getCustomInstanceDetails(instance)
}

export function getCustomRouterDetails (router) {
  return {
    _custom: {
      type: 'router',
      display: 'VueRouter',
      value: {
        options: router.options,
        currentRoute: router.currentRoute
      },
      fields: {
        abstract: true
      }
    }
  }
}

export function getCustomStoreDetails (store) {
  return {
    _custom: {
      type: 'store',
      display: 'Store',
      value: {
        state: store.state,
        getters: getCatchedGetters(store)
      },
      fields: {
        abstract: true
      }
    }
  }
}

export function getCatchedGetters (store) {
  const getters = {}

  const origGetters = store.getters || {}
  const keys = Object.keys(origGetters)
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    Object.defineProperty(getters, key, {
      enumerable: true,
      get: () => {
        try {
          return origGetters[key]
        } catch (e) {
          return e
        }
      }
    })
  }

  return getters
}
