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
    hook.initialStore = {
      state: clone(store.state),
      getters: store.getters
    }
    // Dynamic modules
    hook.storeModules = []
    const origRegister = store.registerModule.bind(store)
    store.registerModule = (path, module, options) => {
      if (typeof path === 'string') path = [path]
      hook.storeModules.push({ path, module, options })
      origRegister(path, module, options)
    }
    const origUnregister = store.unregisterModule.bind(store)
    store.unregisterModule = (path) => {
      if (typeof path === 'string') path = [path]
      const key = path.join('/')
      const index = hook.storeModules.findIndex(m => m.path.join('/') === key)
      if (index !== -1) hook.storeModules.splice(0, 1)
      origUnregister(path)
    }
    hook.flushStoreModules = () => {
      store.registerModule = origRegister
      store.unregisterModule = origUnregister
      return hook.storeModules
    }
  })

  Object.defineProperty(target, '__VUE_DEVTOOLS_GLOBAL_HOOK__', {
    get () {
      return hook
    }
  })

  // Clone deep utility for cloning initial state of the store
  // REFERENCE: https://github.com/pvorb/clone

  let NativeMap
  try {
    NativeMap = Map
  } catch (_) {
    // maybe a reference error because no `Map`. Give it a dummy value that no
    // value will ever be an instanceof.
    NativeMap = function () {}
  }

  let NativeSet
  try {
    NativeSet = Set
  } catch (_) {
    NativeSet = function () {}
  }

  let NativePromise
  try {
    NativePromise = Promise
  } catch (_) {
    NativePromise = function () {}
  }

  function clone (parent, circular, depth, prototype, includeNonEnumerable) {
    if (typeof circular === 'object') {
      depth = circular.depth
      prototype = circular.prototype
      includeNonEnumerable = circular.includeNonEnumerable
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

      if (_instanceof(parent, NativeMap)) {
        child = new NativeMap()
      } else if (_instanceof(parent, NativeSet)) {
        child = new NativeSet()
      } else if (_instanceof(parent, NativePromise)) {
        child = new NativePromise(function (resolve, reject) {
          parent.then(function (value) {
            resolve(_clone(value, depth - 1))
          }, function (err) {
            reject(_clone(err, depth - 1))
          })
        })
      } else if (clone.__isArray(parent)) {
        child = []
      } else if (clone.__isRegExp(parent)) {
        child = new RegExp(parent.source, __getRegExpFlags(parent))
        if (parent.lastIndex) child.lastIndex = parent.lastIndex
      } else if (clone.__isDate(parent)) {
        child = new Date(parent.getTime())
      } else if (useBuffer && Buffer.isBuffer(parent)) {
        if (Buffer.from) {
          // Node.js >= 5.10.0
          child = Buffer.from(parent)
        } else {
          // Older Node.js versions
          // eslint-disable-next-line node/no-deprecated-api
          child = new Buffer(parent.length)
          parent.copy(child)
        }
        return child
      } else if (_instanceof(parent, Error)) {
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

      if (_instanceof(parent, NativeMap)) {
        parent.forEach(function (value, key) {
          var keyChild = _clone(key, depth - 1)
          var valueChild = _clone(value, depth - 1)
          child.set(keyChild, valueChild)
        })
      }
      if (_instanceof(parent, NativeSet)) {
        parent.forEach(function (value) {
          var entryChild = _clone(value, depth - 1)
          child.add(entryChild)
        })
      }

      for (var i in parent) {
        var attrs = Object.getOwnPropertyDescriptor(parent, i)
        if (attrs) {
          if (attrs.hasOwnProperty('get') && attrs.get.name === 'computedGetter') {
            Object.defineProperty(child, i, attrs)
            continue
          }

          child[i] = _clone(parent[i], depth - 1)
        }
      }

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(parent)
        for (let i = 0; i < symbols.length; i++) {
          // Don't need to worry about cloning a symbol because it is a primitive,
          // like a number or string.
          var symbol = symbols[i]
          var descriptor = Object.getOwnPropertyDescriptor(parent, symbol)
          if (descriptor && !descriptor.enumerable && !includeNonEnumerable) {
            continue
          }
          child[symbol] = _clone(parent[symbol], depth - 1)
          Object.defineProperty(child, symbol, descriptor)
        }
      }

      if (includeNonEnumerable) {
        var allPropertyNames = Object.getOwnPropertyNames(parent)
        for (let i = 0; i < allPropertyNames.length; i++) {
          const propertyName = allPropertyNames[i]
          let descriptor = Object.getOwnPropertyDescriptor(parent, propertyName)
          if (descriptor && descriptor.enumerable) {
            continue
          }
          child[propertyName] = _clone(parent[propertyName], depth - 1)
          Object.defineProperty(child, propertyName, descriptor)
        }
      }

      return child
    }

    return _clone(parent, depth)
  }

  // private utility functions

  function __objToStr (o) {
    return Object.prototype.toString.call(o)
  }
  clone.__objToStr = __objToStr

  function __isDate (o) {
    return typeof o === 'object' && __objToStr(o) === '[object Date]'
  }
  clone.__isDate = __isDate

  function __isArray (o) {
    return typeof o === 'object' && __objToStr(o) === '[object Array]'
  }
  clone.__isArray = __isArray

  function __isRegExp (o) {
    return typeof o === 'object' && __objToStr(o) === '[object RegExp]'
  }
  clone.__isRegExp = __isRegExp

  function __getRegExpFlags (re) {
    var flags = ''
    if (re.global) flags += 'g'
    if (re.ignoreCase) flags += 'i'
    if (re.multiline) flags += 'm'
    return flags
  }
  clone.__getRegExpFlags = __getRegExpFlags

  function _instanceof (obj, type) {
    return type != null && obj instanceof type
  }
}
