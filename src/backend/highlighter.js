const overlay = document.createElement('div')
overlay.style.backgroundColor = 'rgba(104, 182, 255, 0.35)'
overlay.style.position = 'fixed'
overlay.style.zIndex = '99999'

/**
 * Highlight an instance.
 *
 * @param {Vue} instance
 */

export function highlight (instance) {
  if (!instance) return
  scrollIntoView(instance.$el)
  if (!instance._isFragment) {
    showOverlay(instance.$el.getBoundingClientRect())
  } else {
    highlightFragment(instance)
  }
}

function scrollIntoView (node) {
  var top = node.offsetTop
  if (top == null) {
    scrollIntoView(node.previousSibling || node.parentNode)
  } else {
    window.scrollTo(0, top)
  }
}

/**
 * Remove highlight overlay.
 */

export function unHighlight () {
  if (overlay.parentNode) {
    document.body.removeChild(overlay)
  }
}

/**
 * Highlight a fragment instance.
 * Loop over its node range and determine its bounding box.
 *
 * @param {Vue} instance
 */

function highlightFragment ({ _fragmentStart, _fragmentEnd }) {
  const Vue = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue
  let top, bottom, left, right
  Vue.util.mapNodeRange(_fragmentStart, _fragmentEnd, function (node) {
    let rect
    if (node.nodeType === 1 || node.getBoundingClientRect) {
      rect = node.getBoundingClientRect()
    } else if (node.nodeType === 3 && node.data.trim()) {
      rect = getTextRect(node)
    }
    if (rect) {
      if (!top || rect.top < top) {
        if (rect.top === 0) debugger
        top = rect.top
      }
      if (!bottom || rect.bottom > bottom) {
        bottom = rect.bottom
      }
      if (!left || rect.left < left) {
        left = rect.left
      }
      if (!right || rect.right > right) {
        right = rect.right
      }
    }
  })
  showOverlay({
    top,
    left,
    width: right - left,
    height: bottom - top
  })
}

/**
 * Get the bounding rect for a text node using a Range.
 *
 * @param {Text} node
 * @return {Rect}
 */

const range = document.createRange()
function getTextRect (node) {
  range.selectNode(node)
  return range.getBoundingClientRect()
}

/**
 * Display the overlay with given rect.
 *
 * @param {Rect}
 */

function showOverlay ({ width = 0, height = 0, top = 0, left = 0 }) {
  overlay.style.width = ~~width + 'px'
  overlay.style.height = ~~height + 'px'
  overlay.style.top = ~~top + 'px'
  overlay.style.left = ~~left + 'px'
  document.body.appendChild(overlay)
}
