// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

// hook should have been injected before this executes.
const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__

let rootInstances = []
let instanceMap = window.__VUE_DEVTOOLS_INSTANCE_MAP__ = new Map()
let currentInspectedId
let bridge

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
  // make sure we hook to Vue only once.
  if (!hook.hasFlushListener) {
    hook.on('flush', flush)
    hook.hasFlushListener = true
  }

  bridge.on('select-instance', id => {
    currentInspectedId = id
    bridge.send('instance-details', getInstanceDetails(id))
  })

  bridge.on('send-to-console', id => {
    window.$vm = instanceMap.get(id)
    console.log('[vue-dev-tools] ' + getInstanceName($vm) + ' is now availabe in the console as $vm.')
  })

  bridge.log('backend ready.')
  bridge.send('ready', hook.Vue.version)
  scan()
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
    instances: rootInstances.map(capture)
  })
}

/**
 * Scan the page for root level Vue instances.
 */

function scan () {
  var inFragment = false
  var currentFragment = null
  walk(document.body, function (node) {
    if (inFragment) {
      if (node === currentFragment._fragmentEnd) {
        inFragment = false
        currentFragment = null
      }
      return true
    }
    var instance = node.__vue__
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
      var stop = fn(node)
      if (!stop) {
        walk(node, fn)
      }
    })
  }
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
    children: instance.$children.map(capture)
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
      props: processProps(instance._props),
      state: JSON.parse(JSON.stringify(instance._data)),
      computed: processComputed(instance)
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
  var name = instance.$options.name
  return name
    ? hook.Vue.util.classify(name)
    : instance._uid === 0
      ? 'Root'
      : 'Anonymous Component'
}

/**
 * Process the props of an instance.
 * Make sure return a plain object because window.postMessage()
 * will throw an Error if the passed object contains Functions.
 *
 * @param {Object} props
 */

function processProps (props) {
  if (!props) {
    return []
  } else {
    return Object.keys(props).map(key => {
      const prop = props[key]
      const options = prop.options
      return {
        name: prop.name,
        path: prop.path,
        raw: prop.raw,
        mode: prop.mode,
        required: !!options.required,
        type: options.type ? options.type.toString() : null,
        twoWay: !!options.twoWay,
        default: options.default
      }
    })
  }
}

/**
 * Process the computed properties of an instance.
 *
 * @param {Vue} instance
 */

function processComputed (instance) {
  return Object.keys(instance.$options.computed || {}).map(key => {
    return {
      key,
      value: instance[key]
    }
  })
}
