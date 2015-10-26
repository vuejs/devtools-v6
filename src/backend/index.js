// This is the backend that is injected into the page that a Vue app lives in
// when the Vue Devtools panel is activated.

let rootInstances = []
let bridge

export function initBackend (b) {
  console.log('[vue-devtools] backend ready.')
  bridge = b
  const hook = window.__VUE_DEVTOOLS_GLOBAL_HOOK__

  bridge.on('message', message => {
    console.log(message)
  })

  bridge.message('yo from backend')

  hook.on('flush', flush)
  scan()
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
    props: instance._props,
    state: instance._data,
    inactive: !!instance._inactive,
    children: instance.$children.map(capture)
  }
}
