export function findRelatedComponent (el) {
  while (!el.__vue__ && el.parentElement) {
    el = el.parentElement
  }
  return el.__vue__
}
