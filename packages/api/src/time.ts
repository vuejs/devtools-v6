let supported: boolean
let perf: Performance

export function isPerformanceSupported () {
  if (supported !== undefined) {
    return supported
  }
  if (typeof window !== 'undefined' && window.performance) {
    supported = true
    perf = window.performance
  } else if (typeof global !== 'undefined' && (global as any).perf_hooks?.performance) {
    supported = true
    perf = (global as any).perf_hooks.performance
  } else {
    supported = false
  }
  return supported
}

export function now () {
  return isPerformanceSupported() ? perf.now() : Date.now()
}
