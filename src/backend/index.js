// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

let rootInstances = []
let instanceMap = window.__VUE_DEVTOOLS_INSTANCE_MAP__ = new Map()
let currentInspectedId
let bridge

export function initBackend (_bridge) {
  bridge = _bridge

  // the backend may get injected to the same page multiple times
  // if the user closes and reopens the devtools.
  // make sure we hook to Vue only once.
  const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
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
  bridge.send('ready')
  scan()
}

function flush () {
  bridge.send('flush', {
    inspectedInstance: getInstanceDetails(currentInspectedId),
    instances: rootInstances.map(capture)
  })
}

function scan () {
  walk(document.body, function (node) {
    if (node.__vue__) {
      rootInstances.push(node.__vue__)
      return true
    }
  })
  flush()
}

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

function mark (instance) {
  if (!instanceMap.has(instance._uid)) {
    instanceMap.set(instance._uid, instance)
    instance.$on('hook:beforeDestroy', function () {
      instanceMap.delete(instance._uid)
    })
  }
}

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

function getInstanceName (instance) {
  return instance.$options.name || (instance._uid === 0 ? 'Root' : 'Anonymous Component')
}

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

function processComputed (instance) {
  return Object.keys(instance.$options.computed || {}).map(key => {
    return {
      key,
      value: instance[key]
    }
  })
}
