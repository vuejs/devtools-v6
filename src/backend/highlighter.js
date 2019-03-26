import { inDoc, classify } from '../util'
import { getInstanceName } from './index'
import SharedData from 'src/shared-data'

const overlay = document.createElement('div')
overlay.style.backgroundColor = 'rgba(104, 182, 255, 0.35)'
overlay.style.position = 'fixed'
overlay.style.zIndex = '99999999999999'
overlay.style.pointerEvents = 'none'
overlay.style.display = 'flex'
overlay.style.alignItems = 'center'
overlay.style.justifyContent = 'center'
overlay.style.borderRadius = '3px'
const overlayContent = document.createElement('div')
overlayContent.style.backgroundColor = 'rgba(104, 182, 255, 0.9)'
overlayContent.style.fontFamily = 'monospace'
overlayContent.style.fontSize = '11px'
overlayContent.style.padding = '2px 3px'
overlayContent.style.borderRadius = '3px'
overlayContent.style.color = 'white'
overlay.appendChild(overlayContent)

/**
 * Highlight an instance.
 *
 * @param {Vue} instance
 */

export function highlight (instance) {
  if (!instance) return
  const rect = getInstanceRect(instance)
  if (rect) {
    let content = ''
    let name = getInstanceName(instance)
    if (SharedData.classifyComponents) name = classify(name)
    if (name) content = `<span style="opacity: .6;">&lt;</span>${name}<span style="opacity: .6;">&gt;</span>`
    showOverlay(rect, content)
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
 * Get the client rect for an instance.
 *
 * @param {Vue} instance
 * @return {Object}
 */

export function getInstanceRect (instance) {
  if (!inDoc(instance.$el)) {
    return
  }
  if (instance._isFragment) {
    return getFragmentRect(instance)
  } else if (instance.$el.nodeType === 1) {
    return instance.$el.getBoundingClientRect()
  }
}

/**
 * Highlight a fragment instance.
 * Loop over its node range and determine its bounding box.
 *
 * @param {Vue} instance
 * @return {Object}
 */

function getFragmentRect ({ _fragmentStart, _fragmentEnd }) {
  let top, bottom, left, right
  util().mapNodeRange(_fragmentStart, _fragmentEnd, function (node) {
    let rect
    if (node.nodeType === 1 || node.getBoundingClientRect) {
      rect = node.getBoundingClientRect()
    } else if (node.nodeType === 3 && node.data.trim()) {
      rect = getTextRect(node)
    }
    if (rect) {
      if (!top || rect.top < top) {
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
  return {
    top,
    left,
    width: right - left,
    height: bottom - top
  }
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

function showOverlay ({ width = 0, height = 0, top = 0, left = 0 }, content = '') {
  overlay.style.width = ~~width + 'px'
  overlay.style.height = ~~height + 'px'
  overlay.style.top = ~~top + 'px'
  overlay.style.left = ~~left + 'px'

  overlayContent.innerHTML = content

  document.body.appendChild(overlay)
}

/**
 * Get Vue's util
 */

function util () {
  return window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue.util
}
