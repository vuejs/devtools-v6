import { AppRecord, BackendContext } from '@vue-devtools/app-backend-api'
import { classify } from '@vue-devtools/shared-utils'
import { ComponentTreeNode } from '@vue/devtools-api'
import { getInstanceOrVnodeRect } from './el'
import { getInstanceName, getRenderKey, getUniqueId, isBeingDestroyed } from './util'

export let instanceMap: Map<any, any>
export let functionalVnodeMap: Map<any, any>

let appRecord: AppRecord

const consoleBoundInstances = Array(5)

let filter = ''
const functionalIds = new Map()

// Dedupe instances
// Some instances may be both on a component and on a child abstract/functional component
const captureIds = new Map()

export function walkTree (instance, pFilter: string, ctx: BackendContext): ComponentTreeNode[] {
  initCtx(ctx)
  filter = pFilter
  functionalIds.clear()
  captureIds.clear()
  const result = findQualifiedChildren(instance)
  if (Array.isArray(result)) {
    return result
  }
  return [result]
}

export function getComponentParents (instance, ctx: BackendContext) {
  initCtx(ctx)
  const captureIds = new Map()

  const captureId = vm => {
    const id = getUniqueId(vm)
    if (captureIds.has(id)) return
    captureIds.set(id, undefined)
    mark(vm)
  }

  const parents = []
  captureId(instance)
  let parent = instance
  while ((parent = parent.$parent)) {
    captureId(parent)
    parents.push(parent)
  }
  return parents
}

function initCtx (ctx: BackendContext) {
  appRecord = ctx.currentAppRecord
  if (!appRecord.meta.instanceMap) {
    appRecord.meta.instanceMap = new Map()
  }
  instanceMap = appRecord.meta.instanceMap
  if (!appRecord.meta.functionalVnodeMap) {
    appRecord.meta.functionalVnodeMap = new Map()
  }
  functionalVnodeMap = appRecord.meta.functionalVnodeMap
}

/**
 * Iterate through an array of instances and flatten it into
 * an array of qualified instances. This is a depth-first
 * traversal - e.g. if an instance is not matched, we will
 * recursively go deeper until a qualified child is found.
 */
function findQualifiedChildrenFromList (instances: any[]): any[] {
  instances = instances
    .filter(child => !isBeingDestroyed(child))
  return !filter
    ? instances.map(capture)
    : Array.prototype.concat.apply([], instances.map(findQualifiedChildren))
}

/**
 * Find qualified children from a single instance.
 * If the instance itself is qualified, just return itself.
 * This is ok because [].concat works in both cases.
 */
function findQualifiedChildren (instance) {
  if (isQualified(instance)) {
    return capture(instance)
  } else {
    return findQualifiedChildrenFromList(instance.$children).concat(
      instance._vnode && instance._vnode.children
        // Find functional components in recursively in non-functional vnodes.
        ? flatten(instance._vnode.children.filter(child => !child.componentInstance).map(captureChild))
          // Filter qualified children.
          .filter(instance => isQualified(instance))
        : []
    )
  }
}

/**
 * Get children from a component instance.
 */
function getInternalInstanceChildren (instance) {
  if (instance.$children) {
    return instance.$children
  }
  if (Array.isArray(instance.subTree.children)) {
    return instance.subTree.children.filter(vnode => !!vnode.component).map(vnode => vnode.component)
  }
  return []
}

/**
 * Check if an instance is qualified.
 */
function isQualified (instance): boolean {
  const name = classify(getInstanceName(instance)).toLowerCase()
  return name.indexOf(filter) > -1
}

function flatten (items) {
  return items.reduce((acc, item) => {
    if (item instanceof Array) acc.push(...flatten(item))
    else if (item) acc.push(item)

    return acc
  }, [])
}

function captureChild (child) {
  if (child.fnContext && !child.componentInstance) {
    return capture(child)
  } else if (child.componentInstance) {
    if (!isBeingDestroyed(child.componentInstance)) return capture(child.componentInstance)
  } else if (child.children) {
    return flatten(child.children.map(captureChild))
  }
}

/**
 * Capture the meta information of an instance. (recursive)
 */
function capture (instance, index?: number, list?: any[]): ComponentTreeNode {
  if (instance.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
    instance = instance.vnode
  }

  if (instance.$options && instance.$options.abstract && instance._vnode && instance._vnode.componentInstance) {
    instance = instance._vnode.componentInstance
  }

  if (instance.$options?.devtools?.hide) return

  // Functional component.
  if (instance.fnContext && !instance.componentInstance) {
    const contextUid = instance.fnContext.__VUE_DEVTOOLS_UID__
    let id = functionalIds.get(contextUid)
    if (id == null) {
      id = 0
    } else {
      id++
    }
    functionalIds.set(contextUid, id)
    const functionalId = contextUid + ':functional:' + id
    markFunctional(functionalId, instance)

    const children = (instance.children
      ? instance.children.map(
        child => child.fnContext
          ? captureChild(child)
          : child.componentInstance
            ? capture(child.componentInstance)
            : undefined
      )
      // router-view has both fnContext and componentInstance on vnode.
      : instance.componentInstance ? [capture(instance.componentInstance)] : []).filter(Boolean)

    return {
      uid: functionalId,
      id: functionalId,
      tags: [
        {
          label: 'functional',
          textColor: 0x555555,
          backgroundColor: 0xeeeeee
        }
      ],
      name: getInstanceName(instance),
      renderKey: getRenderKey(instance.key),
      children,
      hasChildren: !!children.length,
      inactive: false,
      isFragment: false // TODO: Check what is it for.
    }
  }
  // instance._uid is not reliable in devtools as there
  // may be 2 roots with same _uid which causes unexpected
  // behaviour
  instance.__VUE_DEVTOOLS_UID__ = getUniqueId(instance)

  // Dedupe
  if (captureIds.has(instance.__VUE_DEVTOOLS_UID__)) {
    return
  } else {
    captureIds.set(instance.__VUE_DEVTOOLS_UID__, undefined)
  }

  mark(instance)
  const name = getInstanceName(instance)

  const children = getInternalInstanceChildren(instance)
    .filter(child => !isBeingDestroyed(child))
    .map(capture)
    .filter(Boolean)

  const ret: ComponentTreeNode = {
    uid: instance._uid,
    id: instance.__VUE_DEVTOOLS_UID__,
    name,
    renderKey: getRenderKey(instance.$vnode ? instance.$vnode.key : null),
    inactive: !!instance._inactive,
    isFragment: !!instance._isFragment,
    children,
    hasChildren: !!children.length,
    tags: [],
    meta: {}
  }

  if (instance._vnode && instance._vnode.children) {
    ret.children = ret.children.concat(
      flatten(instance._vnode.children.map(captureChild))
        .filter(Boolean)
    )
    ret.hasChildren = !!ret.children.length
  }

  // record screen position to ensure correct ordering
  if ((!list || list.length > 1) && !instance._inactive) {
    const rect = getInstanceOrVnodeRect(instance)
    ret.positionTop = rect ? rect.top : Infinity
  } else {
    ret.positionTop = Infinity
  }

  // check if instance is available in console
  const consoleId = consoleBoundInstances.indexOf(instance.__VUE_DEVTOOLS_UID__)
  ret.consoleId = consoleId > -1 ? '$vm' + consoleId : null

  // check router view
  const isRouterView2 = instance.$vnode && instance.$vnode.data.routerView
  if (instance._routerView || isRouterView2) {
    ret.isRouterView = true
    if (!instance._inactive && instance.$route) {
      const matched = instance.$route.matched
      const depth = isRouterView2
        ? instance.$vnode.data.routerViewDepth
        : instance._routerView.depth
      ret.meta.matchedRouteSegment =
        matched &&
        matched[depth] &&
        (isRouterView2 ? matched[depth].path : matched[depth].handler.path)
    }
    ret.tags.push({
      label: `router-view${ret.meta.matchedRouteSegment ? `: ${ret.meta.matchedRouteSegment}` : ''}`,
      textColor: 0x000000,
      backgroundColor: 0xff8344
    })
  }
  return ret
}

/**
 * Mark an instance as captured and store it in the instance map.
 *
 * @param {Vue} instance
 */

function mark (instance) {
  const refId = instance.__VUE_DEVTOOLS_UID__
  if (!instanceMap.has(refId)) {
    instanceMap.set(refId, instance)
    appRecord.instanceMap.set(refId, instance)
    instance.$on('hook:beforeDestroy', function () {
      instanceMap.delete(refId)
    })
  }
}

function markFunctional (id, vnode) {
  const refId = vnode.fnContext.__VUE_DEVTOOLS_UID__
  if (!functionalVnodeMap.has(refId)) {
    functionalVnodeMap.set(refId, {})
    vnode.fnContext.$on('hook:beforeDestroy', function () {
      functionalVnodeMap.delete(refId)
    })
  }

  functionalVnodeMap.get(refId)[id] = vnode

  appRecord.instanceMap.set(id, {
    __VUE_DEVTOOLS_UID__: id,
    __VUE_DEVTOOLS_FUNCTIONAL_LEGACY__: true,
    vnode
  })
}
