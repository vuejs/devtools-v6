// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

import { highlight, unHighlight } from './highlighter'

// hook should have been injected before this executes.
const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
const rootInstances = []
const propModes = ['default', 'sync', 'once']

let instanceMap = window.__VUE_DEVTOOLS_INSTANCE_MAP__ = new Map()
let currentInspectedId
let bridge
let isLiveMode = true
let filter = ''

export function initBackend (_bridge) {
  bridge = _bridge
  if (hook.Vue) {
    connect()
  } else {
    hook.once('init', connect)
  }
}

function connect () {
  // the backend may get injected to the same page multiple times
  // if the user closes and reopens the devtools.
  // make sure there's only one flush listener.
  hook.off('flush')
  hook.on('flush', () => {
    if (isLiveMode) {
      flush()
    }
  })

  bridge.on('select-instance', id => {
    currentInspectedId = id
    let instance = instanceMap.get(id)
    if (instance) {
      scrollIntoView(instance.$el)
      highlight(instance)
    }
    bridge.send('instance-details', getInstanceDetails(id))
  })

  bridge.on('send-to-console', id => {
    window.$vm = instanceMap.get(id)
    console.log('[vue-devtools] <' + getInstanceName(window.$vm) + '> is now available as $vm.')
  })

  bridge.on('toggle-live-mode', () => {
    isLiveMode = !isLiveMode
    if (isLiveMode) {
      flush()
    }
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
  console.log('[vue-devtools] ready.')
  scan()
}

/**
 * Scan the page for root level Vue instances.
 */

function scan () {
  rootInstances.length = 0
  let inFragment = false
  let currentFragment = null
  walk(document.body, function (node) {
    if (inFragment) {
      if (node === currentFragment._fragmentEnd) {
        inFragment = false
        currentFragment = null
      }
      return true
    }
    let instance = node.__vue__
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
      let stop = fn(node)
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
  bridge.send('flush', {
    inspectedInstance: getInstanceDetails(currentInspectedId),
    instances: findQualifiedChildrenFromList(rootInstances)
  })
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
    : instances
      .map(findQualifiedChildren)
      .reduce((all, qualified) => all.concat(qualified), [])
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
  let name = getInstanceName(instance).toLowerCase()
  return name.indexOf(filter) > -1
}

/**
 * Capture the meta information of an instance. (recursive)
 *
 * @param {Vue} instance
 * @return {Object}
 */

function capture (instance) {
  mark(instance)
  return {
    id: instance._uid,
    name: getInstanceName(instance),
    inactive: !!instance._inactive,
    isFragment: !!instance._isFragment,
    children: instance.$children
      .filter(child => !child._isBeingDestroyed)
      .map(capture)
  }
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
  let instance = instanceMap.get(id)
  if (!instance) {
    return {}
  } else {
    return {
      id: id,
      name: getInstanceName(instance),
      state: processProps(instance)
        .concat(processState(instance))
        .concat(processComputed(instance))
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
  let name = instance.$options.name
  return name
    ? hook.Vue.util.classify(name)
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
  const props = instance._props
  if (!props) {
    return []
  } else {
    return Object.keys(props).map(key => {
      const prop = props[key]
      const options = prop.options
      return {
        type: 'prop',
        key: prop.path,
        value: sanitize(instance[prop.path]),
        meta: {
          'type': options.type ? getPropType(options.type) : 'any',
          required: !!options.required,
          'binding mode': propModes[prop.mode]
        }
      }
    })
  }
}

/**
 * Convert prop type constructor to string.
 *
 * @param {Function} fn
 */

const fnTypeRE = /^function (\w+)\(\)/
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
  const props = instance._props
  return Object.keys(instance._data)
    .filter(key => !props || !(key in props))
    .map(key => ({
      key,
      value: sanitize(instance[key])
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
      value: sanitize(instance[key])
    }
  })
}

/**
 * Recursively sanitize data to be posted to the other side.
 * Since the message posted is sent with structured clone,
 * we need to filter out any types that might cause an error.
 *
 * @param {*} data
 * @return {*}
 */

function sanitize (data) {
  if (Array.isArray(data)) {
    return data.map(sanitize)
  } else if (hook.Vue.util.isPlainObject(data)) {
    var ret = {}
    Object.keys(data).forEach(key => {
      ret[key] = sanitize(data[key])
    })
    return ret
  } else if (isPrimitive(data)) {
    return data
  } else {
    // handle types that will probably cause issues in
    // the structured clone
    return Object.prototype.toString.call(data)
  }
}

var primitiveTypeRE = /^(string|number|boolean)$/
function isPrimitive (data) {
  return data == null ||
    primitiveTypeRE.test(typeof data) ||
    data instanceof RegExp
}

/**
 * Sroll a node into view.
 *
 * @param {Node} node
 */

function scrollIntoView (node) {
  if (!hook.Vue.util.inDoc(node)) {
    return
  }
  var top = node.offsetTop
  if (top == null) {
    scrollIntoView(node.previousSibling || node.parentNode)
  } else {
    window.scrollTo(0, top)
  }
}
