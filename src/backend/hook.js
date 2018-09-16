// this script is injected into every page.

/**
 * Install the hook on window, which is an event emitter.
 * Note because Chrome content scripts cannot directly modify the window object,
 * we are evaling this function by inserting a script tag. That's why we have
 * to inline the whole event emitter implementation here.
 *
 * @param {Window|global} target
 */

export function installHook (target) {
  let listeners = {}

  if (target.hasOwnProperty('__VUE_DEVTOOLS_GLOBAL_HOOK__')) return

  const hook = {
    Vue: null,

    _buffer: [],

    _replayBuffer (event) {
      let buffer = this._buffer
      this._buffer = []

      for (let i = 0, l = buffer.length; i < l; i++) {
        let allArgs = buffer[i]
        allArgs[0] === event
          ? this.emit.apply(this, allArgs)
          : this._buffer.push(allArgs)
      }
    },

    on (event, fn) {
      const $event = '$' + event
      if (listeners[$event]) {
        listeners[$event].push(fn)
      } else {
        listeners[$event] = [fn]
        this._replayBuffer(event)
      }
    },

    once (event, fn) {
      function on () {
        this.off(event, on)
        fn.apply(this, arguments)
      }
      this.on(event, on)
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
      const $event = '$' + event
      let cbs = listeners[$event]
      if (cbs) {
        const eventArgs = [].slice.call(arguments, 1)
        cbs = cbs.slice()
        for (let i = 0, l = cbs.length; i < l; i++) {
          cbs[i].apply(this, eventArgs)
        }
      } else {
        const allArgs = [].slice.call(arguments)
        this._buffer.push(allArgs)
      }
    }
  }

  hook.once('init', Vue => {
    hook.Vue = Vue

    Vue.prototype.$inspect = function () {
      const fn = target.__VUE_DEVTOOLS_INSPECT__
      fn && fn(this)
    }
  })

  hook.once('vuex:init', store => {
    hook.store = store
    hook.initialStore = clone(store)
  })

  Object.defineProperty(target, '__VUE_DEVTOOLS_GLOBAL_HOOK__', {
    get () {
      return hook
    }
  })

  // Clone deep utility for cloning initial state of the store
  // REFERENCE: https://github.com/buunguyen/node-clone/commit/63afda9de9d94b9332586e34a646a13e8d719244

  function clone (parent, circular, depth, prototype) {
    if (typeof circular === 'object') {
      depth = circular.depth
      prototype = circular.prototype
      circular = circular.circular
    }
    // maintain two arrays for circular references, where corresponding parents
    // and children have the same index
    var allParents = []
    var allChildren = []

    var useBuffer = typeof Buffer !== 'undefined'

    if (typeof circular === 'undefined') { circular = true }

    if (typeof depth === 'undefined') { depth = Infinity }

    // recurse this function so we don't reset allParents and allChildren
    function _clone (parent, depth) {
      // cloning null always returns null
      if (parent === null) { return null }

      if (depth === 0) { return parent }

      var child
      var proto
      if (typeof parent !== 'object') {
        return parent
      }

      if (parent instanceof Map) {
        child = new Map()
      } else if (parent instanceof Set) {
        child = new Set()
      } else if (parent instanceof Promise) {
        child = new Promise(function (resolve, reject) {
          parent.then(function (value) {
            resolve(_clone(value, depth - 1))
          }, function (err) {
            reject(_clone(err, depth - 1))
          })
        })
      } else if (_isArray(parent)) {
        child = []
      } else if (_isRegExp(parent)) {
        child = new RegExp(parent.source, _getRegExpFlags(parent))
        if (parent.lastIndex) child.lastIndex = parent.lastIndex
      } else if (_isDate(parent)) {
        child = new Date(parent.getTime())
      } else if (useBuffer && Buffer.isBuffer(parent)) {
        child = Buffer.alloc(parent.length)
        parent.copy(child)
        return child
      } else if (parent instanceof Error) {
        child = Object.create(parent)
      } else {
        if (typeof prototype === 'undefined') {
          proto = Object.getPrototypeOf(parent)
          child = Object.create(proto)
        } else {
          child = Object.create(prototype)
          proto = prototype
        }
      }

      if (circular) {
        var index = allParents.indexOf(parent)

        if (index !== -1) {
          return allChildren[index]
        }
        allParents.push(parent)
        allChildren.push(child)
      }

      if (parent instanceof Map) {
        var keyIterator = parent.keys()
        while (true) {
          let next = keyIterator.next()
          if (next.done) {
            break
          }
          var keyChild = _clone(next.value, depth - 1)
          var valueChild = _clone(parent.get(next.value), depth - 1)
          child.set(keyChild, valueChild)
        }
      }
      if (parent instanceof Set) {
        var iterator = parent.keys()
        while (true) {
          let next = iterator.next()
          if (next.done) {
            break
          }
          var entryChild = _clone(next.value, depth - 1)
          child.add(entryChild)
        }
      }

      for (let i in parent) {
        var attrs
        if (proto) {
          attrs = Object.getOwnPropertyDescriptor(proto, i)
        }

        if (attrs && attrs.set == null) {
          continue
        }
        child[i] = _clone(parent[i], depth - 1)
      }

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(parent)
        for (let i = 0; i < symbols.length; i++) {
          // Don't need to worry about cloning a symbol because it is a primitive,
          // like a number or string.
          var symbol = symbols[i]
          var descriptor = Object.getOwnPropertyDescriptor(parent, symbol)
          if (descriptor && !descriptor.enumerable) {
            continue
          }
          child[symbol] = _clone(parent[symbol], depth - 1)
        }
      }

      return child
    }

    return _clone(parent, depth)
  }

  // private utility functions

  function _objToStr (o) {
    return Object.prototype.toString.call(o)
  }

  function _isDate (o) {
    return typeof o === 'object' && _objToStr(o) === '[object Date]'
  }

  function _isArray (o) {
    return typeof o === 'object' && _objToStr(o) === '[object Array]'
  }

  function _isRegExp (o) {
    return typeof o === 'object' && _objToStr(o) === '[object RegExp]'
  }

  function _getRegExpFlags (re) {
    var flags = ''
    if (re.global) flags += 'g'
    if (re.ignoreCase) flags += 'i'
    if (re.multiline) flags += 'm'
    return flags
  }
}
