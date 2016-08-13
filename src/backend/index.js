// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

import { highlight, unHighlight, getInstanceRect } from './highlighter'
import { initVuexBackend } from './vuex'
import { stringify, classify, camelize } from '../util'

// hook should have been injected before this executes.
const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
const rootInstances = []
const propModes = ['default', 'sync', 'once']

const instanceMap = window.__VUE_DEVTOOLS_INSTANCE_MAP__ = new Map()
let currentInspectedId
let bridge
let filter = ''
let captureCount = 0

export function initBackend (_bridge) {
  bridge = _bridge
  if (hook.Vue) {
    connect()
  } else {
    hook.once('init', connect)
  }
  if (hook.store) {
    initVuexBackend(hook, bridge)
  } else {
    hook.once('vuex:init', store => {
      initVuexBackend(hook, bridge)
    })
  }
}

function connect () {
  hook.currentTab = 'components'
  bridge.on('switch-tab', tab => {
    hook.currentTab = tab
    if (tab === 'components') {
      flush()
    }
  })

  // the backend may get injected to the same page multiple times
  // if the user closes and reopens the devtools.
  // make sure there's only one flush listener.
  hook.off('flush')
  hook.on('flush', () => {
    if (hook.currentTab === 'components') {
      flush()
    }
  })

  bridge.on('select-instance', id => {
    currentInspectedId = id
    const instance = instanceMap.get(id)
    if (instance) {
      scrollIntoView(instance)
      highlight(instance)
    }
    bridge.send('instance-details', stringify(getInstanceDetails(id)))
  })

  bridge.on('send-to-console', id => {
    window.$vm = instanceMap.get(id)
    console.log('[vue-devtools] <' + getInstanceName(window.$vm) + '> is now available as $vm.')
  })

  bridge.on('filter-instances', _filter => {
    filter = _filter.toLowerCase()
    flush()
  })

  bridge.on('refresh', scan)
  bridge.on('enter-instance', id => highlight(instanceMap.get(id)))
  bridge.on('leave-instance', unHighlight)

  bridge.log('backend ready.')
  bridge.send('ready', hook.Vue.version)
  console.log('[vue-devtools] Ready. Detected Vue v' + hook.Vue.version)
  scan()
}

/**
 * Scan the page for root level Vue instances.
 */

function scan () {
  rootInstances.length = 0
  let inFragment = false
  let currentFragment = null
  walk(document, function (node) {
    if (inFragment) {
      if (node === currentFragment._fragmentEnd) {
        inFragment = false
        currentFragment = null
      }
      return true
    }
    const instance = node.__vue__
    if (instance) {
      if (instance._isFragment) {
        inFragment = true
        currentFragment = instance
      }
      rootInstances.push(instance)
      return true
    }
  })
  flush()
}

/**
 * DOM walk helper
 *
 * @param {NodeList} nodes
 * @param {Function} fn
 */

function walk (node, fn) {
  if (node.childNodes) {
    Array.prototype.forEach.call(node.childNodes, function (node) {
      const stop = fn(node)
      if (!stop) {
        walk(node, fn)
      }
    })
  }
}

/**
 * Called on every Vue.js batcher flush cycle.
 * Capture current component tree structure and the state
 * of the current inspected instance (if present) and
 * send it to the devtools.
 */

function flush () {
  let start
  if (process.env.NODE_ENV !== 'production') {
    captureCount = 0
    start = window.performance.now()
  }
  const payload = stringify({
    inspectedInstance: getInstanceDetails(currentInspectedId),
    instances: findQualifiedChildrenFromList(rootInstances)
  })
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[flush] serialized ${captureCount} instances, took ${window.performance.now() - start}ms.`)
  }
  bridge.send('flush', payload)
}

/**
 * Iterate through an array of instances and flatten it into
 * an array of qualified instances. This is a depth-first
 * traversal - e.g. if an instance is not matched, we will
 * recursively go deeper until a qualified child is found.
 *
 * @param {Array} instances
 * @return {Array}
 */

function findQualifiedChildrenFromList (instances) {
  instances = instances
    .filter(child => !child._isBeingDestroyed)
  return !filter
    ? instances.map(capture)
    : Array.prototype.concat.apply([], instances.map(findQualifiedChildren))
}

/**
 * Find qualified children from a single instance.
 * If the instance itself is qualified, just return itself.
 * This is ok because [].concat works in both cases.
 *
 * @param {Vue} instance
 * @return {Vue|Array}
 */

function findQualifiedChildren (instance) {
  return isQualified(instance)
    ? capture(instance)
    : findQualifiedChildrenFromList(instance.$children)
}

/**
 * Check if an instance is qualified.
 *
 * @param {Vue} instance
 * @return {Boolean}
 */

function isQualified (instance) {
  const name = getInstanceName(instance).toLowerCase()
  return name.indexOf(filter) > -1
}

/**
 * Capture the meta information of an instance. (recursive)
 *
 * @param {Vue} instance
 * @return {Object}
 */

function capture (instance, _, list) {
  if (process.env.NODE_ENV !== 'production') {
    captureCount++
  }
  mark(instance)
  const ret = {
    id: instance._uid,
    name: getInstanceName(instance),
    inactive: !!instance._inactive,
    isFragment: !!instance._isFragment,
    children: instance.$children
      .filter(child => !child._isBeingDestroyed)
      .map(capture)
  }
  // record screen position to ensure correct ordering
  if ((!list || list.length > 1) && !instance._inactive) {
    const rect = getInstanceRect(instance)
    ret.top = rect ? rect.top : Infinity
  } else {
    ret.top = Infinity
  }
  // check router view
  const isRouterView2 = instance.$vnode && instance.$vnode.data.routerView
  if (instance._routerView || isRouterView2) {
    ret.isRouterView = true
    if (!instance._inactive) {
      const matched = instance.$route.matched
      const depth = isRouterView2
        ? instance.$vnode.data.routerViewDepth
        : instance._routerView.depth
      ret.matchedRouteSegment =
        matched &&
        matched[depth] &&
        (isRouterView2 ? matched[depth].path : matched[depth].handler.path)
    }
  }
  return ret
}

/**
 * Mark an instance as captured and store it in the instance map.
 *
 * @param {Vue} instance
 */

function mark (instance) {
  if (!instanceMap.has(instance._uid)) {
    instanceMap.set(instance._uid, instance)
    instance.$on('hook:beforeDestroy', function () {
      instanceMap.delete(instance._uid)
    })
  }
}

/**
 * Get the detailed information of an inspected instance.
 *
 * @param {Number} id
 */

function getInstanceDetails (id) {
  const instance = instanceMap.get(id)
  if (!instance) {
    return {}
  } else {
    return {
      id: id,
      name: getInstanceName(instance),
      state: processProps(instance).concat(
        processState(instance),
        processComputed(instance),
        processRouteContext(instance),
        processVuexGetters(instance),
        processFirebaseBindings(instance)
      )
    }
  }
}

/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {String}
 */

function getInstanceName (instance) {
  const name = instance.$options.name || instance.$options._componentTag
  return name
    ? classify(name)
    : instance.$root === instance
      ? 'Root'
      : 'Anonymous Component'
}

/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processProps (instance) {
  let props
  if ((props = instance._props)) {
    // 1.x
    return Object.keys(props).map(key => {
      const prop = props[key]
      const options = prop.options
      return {
        type: 'prop',
        key: prop.path,
        value: instance[prop.path],
        meta: {
          'type': options.type ? getPropType(options.type) : 'any',
          required: !!options.required,
          'binding mode': propModes[prop.mode]
        }
      }
    })
  } else if ((props = instance.$options.props)) {
    // 2.0
    return Object.keys(props).map(key => {
      const prop = props[key]
      key = camelize(key)
      return {
        type: 'prop',
        key,
        value: instance[key],
        meta: {
          type: prop.type ? getPropType(prop.type) : 'any',
          required: !!prop.required
        }
      }
    })
  } else {
    return []
  }
}

/**
 * Convert prop type constructor to string.
 *
 * @param {Function} fn
 */

const fnTypeRE = /^function (\w+)\(/
function getPropType (type) {
  return typeof type === 'function'
    ? type.toString().match(fnTypeRE)[1]
    : 'any'
}

/**
 * Process state, filtering out props and "clean" the result
 * with a JSON dance. This removes functions which can cause
 * errors during structured clone used by window.postMessage.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processState (instance) {
  const props = instance._props || instance.$options.props
  const getters =
    instance.$options.vuex &&
    instance.$options.vuex.getters
  return Object.keys(instance._data)
    .filter(key => (
      !(props && key in props) &&
      !(getters && key in getters)
    ))
    .map(key => ({
      key,
      value: instance[key]
    }))
}

/**
 * Process the computed properties of an instance.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processComputed (instance) {
  return Object.keys(instance.$options.computed || {}).map(key => {
    return {
      type: 'computed',
      key,
      value: instance[key]
    }
  })
}

/**
 * Process possible vue-router $route context
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processRouteContext (instance) {
  const route = instance.$route
  if (route) {
    const { path, query, params } = route
    const value = { path, query, params }
    if (route.fullPath) value.fullPath = route.fullPath
    if (route.hash) value.hash = route.hash
    if (route.name) value.name = route.name
    if (route.meta) value.meta = route.meta
    return [{
      key: '$route',
      value
    }]
  } else {
    return []
  }
}

/**
 * Process Vuex getters.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processVuexGetters (instance) {
  const getters =
    instance.$options.vuex &&
    instance.$options.vuex.getters
  if (getters) {
    return Object.keys(getters).map(key => {
      return {
        type: 'vuex getter',
        key,
        value: instance[key]
      }
    })
  } else {
    return []
  }
}

/**
 * Process Firebase bindings.
 *
 * @param {Vue} instance
 * @return {Array}
 */

function processFirebaseBindings (instance) {
  var refs = instance.$firebaseRefs
  if (refs) {
    return Object.keys(refs).map(key => {
      return {
        type: 'firebase binding',
        key,
        value: instance[key]
      }
    })
  } else {
    return []
  }
}

/**
 * Sroll a node into view.
 *
 * @param {Vue} instance
 */

function scrollIntoView (instance) {
  const rect = getInstanceRect(instance)
  if (rect) {
    window.scrollBy(0, rect.top)
  }
}
