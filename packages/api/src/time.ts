let supported: boolean
let perf: Performance

function isSupported () {
  if (supported !== undefined) {
    return supported
  }
  if (typeof window !== 'undefined' && window.performance) {
    supported = true
    perf = window.performance
  } else {
    supported = false
  }
  return supported
}

export function now () {
  return isSupported() ? perf.now() : Date.now()
}
