
let pendingCallbacks: Array<(time: number) => void> = []

/**
 * requestAnimationFrame that also works on non-browser environments like Node.
 */
export const raf = typeof requestAnimationFrame === 'function'
  ? requestAnimationFrame
  : (fn: (time: number) => void) => {
      if (!pendingCallbacks.length) {
        setImmediate(() => {
          const now = performance.now()
          const cbs = pendingCallbacks
          // in case cbs add new callbacks
          pendingCallbacks = []
          cbs.forEach(cb => cb(now))
        })
      }

      pendingCallbacks.push(fn)
    }
