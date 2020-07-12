import { classify, isBrowser, inDoc } from '@vue-devtools/shared-utils'
import { basename } from '../util'
import { BackendContext } from '@vue-devtools/app-backend-api'

export function isBeingDestroyed (instance) {
  return instance._isBeingDestroyed || instance.isUnmounted
}

export function getAppRecord (instance) {
  if (instance.root) {
    return instance.appContext.__app.__VUE_DEVTOOLS_APP_RECORD__
  }
}

export function isFragment (instance) {
  const appRecord = getAppRecord(instance)
  if (appRecord) {
    return appRecord.options.types.Fragment === instance.subTree.type
  }
}

/**
 * Get the appropriate display name for an instance.
 *
 * @param {Vue} instance
 * @return {String}
 */
export function getInstanceName (instance) {
  const name = getComponentTypeName(instance.type || {})
  if (name) return name
  return instance.root === instance
    ? 'Root'
    : 'Anonymous Component'
}

function getComponentTypeName (options) {
  const name = options.name || options._componentTag
  if (name) {
    return name
  }
  const file = options.__file // injected by vue-loader
  if (file) {
    return classify(basename(file, '.vue'))
  }
}

/**
 * Returns a devtools unique id for instance.
 * @param {Vue} instance
 */
export function getUniqueComponentId (instance, ctx: BackendContext) {
  const instanceId = instance === ctx.currentAppRecord.rootInstance ? 'root' : instance.uid
  return `${ctx.currentAppRecord.id}:${instanceId}`
}

export function getRenderKey (value): string {
  if (value == null) return
  const type = typeof value
  if (type === 'number') {
    return value
  } else if (type === 'string') {
    return `'${value}'`
  } else if (Array.isArray(value)) {
    return 'Array'
  } else {
    return 'Object'
  }
}

/**
 * Get the client rect for an instance.
 *
 * @param {Vue|Vnode} instance
 * @return {Object}
 */
export function getInstanceOrVnodeRect (instance) {
  const el = instance.subTree.el

  if (!isBrowser) {
    // @TODO: Find position from instance or a vnode (for functional components).
    return
  }
  if (!inDoc(el)) {
    return
  }

  if (isFragment(instance)) {
    return getFragmentRect(instance.subTree)
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

function getFragmentRect (vnode) {
  const rect = createRect()
  if (!vnode.children) return rect

  for (let i = 0, l = vnode.children.length; i < l; i++) {
    const childVnode = vnode.children[i]
    let childRect
    if (childVnode.component) {
      childRect = getInstanceOrVnodeRect(childVnode.component)
    } else if (childVnode.el) {
      const el = childVnode.el
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
