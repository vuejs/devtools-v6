// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

let rootInstances = []
let instanceMap = new Map()
let bridge

export function initBackend (_bridge) {
  bridge = _bridge
  const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
  hook.on('flush', flush)
  scan()
  bridge.on('select-instance', selectInstance)
  bridge.message('Ready.')
}

function flush () {
  bridge.send({
    event: 'flush',
    payload: rootInstances.map(capture)
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
    name: instance.$options.name || 'Anonymous Component',
    id: instance._uid,
    inactive: !!instance._inactive,
    children: instance.$children.map(capture)
  }
}

function mark (instance) {
  if (!instance._markedByDevtool) {
    instanceMap.set(instance._uid, instance)
    instance._markedByDevtool = true
    instance.$on('hook:beforeDestroy', function () {
      instanceMap.delete(instance._uid)
    })
  }
}

function selectInstance (id) {
  let instance = instanceMap.get(id)
  bridge.send({
    event: 'instance-details',
    payload: {
      name: instance.$options.name || 'Anonymous Component',
      props: processProps(instance._props),
      state: JSON.parse(JSON.stringify(instance._data)),
      computed: processComputed(instance)
    }
  })
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
