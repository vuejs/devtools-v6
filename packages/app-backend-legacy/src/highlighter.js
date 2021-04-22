import { inDoc, getComponentName, getComponentDisplayName } from '@utils/util'
import SharedData from '@utils/shared-data'
import { isBrowser, target } from '@utils/env'
import { getInstanceName } from './index'
import { isFragment } from './components'

let overlay
let overlayContent

function init () {
  if (overlay || !isBrowser) return
  overlay = document.createElement('div')
  overlay.style.backgroundColor = 'rgba(104, 182, 255, 0.35)'
  overlay.style.position = 'fixed'
  overlay.style.zIndex = '99999999999999'
  overlay.style.pointerEvents = 'none'
  overlay.style.display = 'flex'
  overlay.style.alignItems = 'center'
  overlay.style.justifyContent = 'center'
  overlay.style.borderRadius = '3px'
  overlayContent = document.createElement('div')
  overlayContent.style.backgroundColor = 'rgba(104, 182, 255, 0.9)'
  overlayContent.style.fontFamily = 'monospace'
  overlayContent.style.fontSize = '11px'
  overlayContent.style.padding = '2px 3px'
  overlayContent.style.borderRadius = '3px'
  overlayContent.style.color = 'white'
  overlay.appendChild(overlayContent)
}

/**
 * Highlight an instance.
 *
 * @param {Vue} instance
 */

export function highlight (instance) {
  if (!instance) return
  const rect = getInstanceOrVnodeRect(instance)

  if (!isBrowser) {
    // TODO: Highlight rect area.
    return
  }

  init()
  if (rect) {
    const content = []
    let name = instance.fnContext ? getComponentName(instance.fnOptions) : getInstanceName(instance)
    name = getComponentDisplayName(name, SharedData.componentNameStyle)
    if (name) {
      const pre = document.createElement('span')
      pre.style.opacity = '0.6'
      pre.innerText = '<'
      const text = document.createTextNode(name)
      const post = document.createElement('span')
      post.style.opacity = '0.6'
      post.innerText = '>'
      content.push(pre, text, post)
    }
    showOverlay(rect, content)
  }
}

/**
 * Remove highlight overlay.
 */

export function unHighlight () {
  if (overlay && overlay.parentNode) {
    document.body.removeChild(overlay)
  }
}

/**
 * Get the client rect for an instance.
 *
 * @param {Vue|Vnode} instance
 * @return {Object}
 */

export function getInstanceOrVnodeRect (instance) {
  const el = instance.subTree ? instance.subTree.el : instance.$el || instance.elm

  if (!isBrowser) {
    // TODO: Find position from instance or a vnode (for functional components).

    return
  }
  if (!inDoc(el)) {
    return
  }

  if (isFragment(instance)) {
    return getFragmentRect(instance.subTree)
  } else if (instance._isFragment) {
    return getLegacyFragmentRect(instance)
  } else if (el.nodeType === 1) {
    return el.getBoundingClientRect()
  }
}

function createRect () {
  const rect = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    get width () { return rect.right - rect.left },
    get height () { return rect.bottom - rect.top }
  }
  return rect
}

function mergeRects (a, b) {
  if (!a.top || b.top < a.top) {
    a.top = b.top
  }
  if (!a.bottom || b.bottom > a.bottom) {
    a.bottom = b.bottom
  }
  if (!a.left || b.left < a.left) {
    a.left = b.left
  }
  if (!a.right || b.right > a.right) {
    a.right = b.right
  }
}

function getFragmentRect (vnode) {
  const rect = createRect()

  for (let i = 0, l = vnode.children.length; i < l; i++) {
    const child = vnode.children[i]
    let childRect
    if (isFragment(child)) {
      childRect = getFragmentRect(child)
    } else if (child.el) {
      const el = child.el
      if (el.nodeType === 1 || el.getBoundingClientRect) {
        childRect = el.getBoundingClientRect()
      } else if (el.nodeType === 3 && el.data.trim()) {
        childRect = getTextRect(el)
      }
    }
    if (childRect) {
      mergeRects(rect, childRect)
    }
  }

  return rect
}

/**
 * Highlight a fragment instance.
 * Loop over its node range and determine its bounding box.
 *
 * @param {Vue} instance
 * @return {Object}
 */

function getLegacyFragmentRect ({ _fragmentStart, _fragmentEnd }) {
  const rect = createRect()
  util().mapNodeRange(_fragmentStart, _fragmentEnd, function (node) {
    let childRect
    if (node.nodeType === 1 || node.getBoundingClientRect) {
      childRect = node.getBoundingClientRect()
    } else if (node.nodeType === 3 && node.data.trim()) {
      childRect = getTextRect(node)
    }
    if (childRect) {
      mergeRects(rect, childRect)
    }
  })
  return rect
}

let range
/**
 * Get the bounding rect for a text node using a Range.
 *
 * @param {Text} node
 * @return {Rect}
 */
function getTextRect (node) {
  if (!isBrowser) return
  if (!range) range = document.createRange()

  range.selectNode(node)

  return range.getBoundingClientRect()
}

/**
 * Display the overlay with given rect.
 *
 * @param {Rect}
 */

function showOverlay ({ width = 0, height = 0, top = 0, left = 0 }, content = []) {
  if (!isBrowser) return

  overlay.style.width = ~~width + 'px'
  overlay.style.height = ~~height + 'px'
  overlay.style.top = ~~top + 'px'
  overlay.style.left = ~~left + 'px'

  overlayContent.innerHTML = ''
  content.forEach(child => overlayContent.appendChild(child))

  document.body.appendChild(overlay)
}

/**
 * Get Vue's util
 */

function util () {
  return target.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue.util
}
