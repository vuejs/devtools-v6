// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

let rootInstances = []
let bridge

export function initBackend (_bridge) {
  bridge = _bridge
  const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__
  hook.on('flush', flush)
  scan()
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
  return {
    name: instance.$options.name || 'Component',
    id: instance._uid,
    inactive: !!instance._inactive,
    children: instance.$children.map(capture)
  }
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
