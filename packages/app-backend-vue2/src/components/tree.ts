import { AppRecord, BackendContext, DevtoolsApi } from '@vue-devtools/app-backend-api'
import { classify, kebabize } from '@vue-devtools/shared-utils'
import { ComponentTreeNode, ComponentInstance } from '@vue/devtools-api'
import { getRootElementsFromComponentInstance } from './el'
import { applyPerfHooks } from './perf.js'
import { applyTrackingUpdateHook } from './update-tracking.js'
import { getInstanceName, getRenderKey, getUniqueId, isBeingDestroyed } from './util'

export let instanceMap: Map<any, any>
export let functionalVnodeMap: Map<any, any>

let appRecord: AppRecord
let api: DevtoolsApi

const consoleBoundInstances = Array(5)

let filter = ''
let recursively = false
const functionalIds = new Map()

// Dedupe instances
// Some instances may be both on a component and on a child abstract/functional component
const captureIds = new Map()

export async function walkTree (instance, pFilter: string, pRecursively: boolean, api: DevtoolsApi, ctx: BackendContext): Promise<ComponentTreeNode[]> {
  initCtx(api, ctx)
  filter = pFilter
  recursively = pRecursively
  functionalIds.clear()
  captureIds.clear()
  const result: ComponentTreeNode[] = flatten(await findQualifiedChildren(instance))
  return result
}

export function getComponentParents (instance, api: DevtoolsApi, ctx: BackendContext) {
  initCtx(api, ctx)
  const captureIds = new Map()

  const captureId = vm => {
    const id = vm.__VUE_DEVTOOLS_UID__ = getUniqueId(vm)
    if (captureIds.has(id)) return
    captureIds.set(id, undefined)
    if (vm.__VUE_DEVTOOLS_FUNCTIONAL_LEGACY__) {
      markFunctional(id, vm.vnode)
    } else {
      mark(vm)
    }
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

function initCtx (_api: DevtoolsApi, ctx: BackendContext) {
  appRecord = ctx.currentAppRecord
  api = _api
  if (!appRecord.meta) {
    appRecord.meta = {}
  }
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
function findQualifiedChildrenFromList (instances: any[]): Promise<ComponentTreeNode[]> {
  instances = instances
    .filter(child => !isBeingDestroyed(child))
  return Promise.all(!filter
    ? instances.map(capture)
    : Array.prototype.concat.apply([], instances.map(findQualifiedChildren)))
}

/**
 * Find qualified children from a single instance.
 * If the instance itself is qualified, just return itself.
 * This is ok because [].concat works in both cases.
 */
async function findQualifiedChildren (instance): Promise<ComponentTreeNode[]> {
  if (isQualified(instance)) {
    return [await capture(instance)]
  } else {
    let children = await findQualifiedChildrenFromList(instance.$children)

    // Find functional components in recursively in non-functional vnodes.
    if (instance._vnode && instance._vnode.children) {
      const list = await Promise.all(flatten<Promise<ComponentTreeNode>>((instance._vnode.children as any[]).filter(child => !child.componentInstance).map(captureChild)))
      // Filter qualified children.
      const additionalChildren = list.filter(instance => isQualified(instance))
      children = children.concat(additionalChildren)
    }

    return children
  }
}

/**
 * Get children from a component instance.
 */
function getInternalInstanceChildren (instance): any[] {
  if (instance.$children) {
    return instance.$children
  }
  return []
}

/**
 * Check if an instance is qualified.
 */
function isQualified (instance): boolean {
  const name = getInstanceName(instance)
  return classify(name).toLowerCase().indexOf(filter) > -1 ||
    kebabize(name).toLowerCase().indexOf(filter) > -1
}

function flatten<T> (items: any[]): T[] {
  const r = items.reduce((acc, item) => {
    if (Array.isArray(item)) {
      let children = []
      for (const i of item) {
        if (Array.isArray(i)) {
          children = children.concat(flatten(i))
        } else {
          children.push(i)
        }
      }
      acc.push(...children)
    } else if (item) {
      acc.push(item)
    }

    return acc
  }, [] as T[])
  return r
}

function captureChild (child): Promise<ComponentTreeNode[] | ComponentTreeNode> {
  if (child.fnContext && !child.componentInstance) {
    return capture(child)
  } else if (child.componentInstance) {
    if (!isBeingDestroyed(child.componentInstance)) return capture(child.componentInstance)
  } else if (child.children) {
    return Promise.all(flatten<Promise<ComponentTreeNode>>(child.children.map(captureChild)))
  }
}

/**
 * Capture the meta information of an instance. (recursive)
 */
async function capture (instance, index?: number, list?: any[]): Promise<ComponentTreeNode> {
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

    const childrenPromise = (instance.children
      ? instance.children.map(
        child => child.fnContext
          ? captureChild(child)
          : child.componentInstance
            ? capture(child.componentInstance)
            : undefined,
      )
      // router-view has both fnContext and componentInstance on vnode.
      : instance.componentInstance ? [capture(instance.componentInstance)] : [])

    // await all childrenCapture to-be resolved
    const children = (await Promise.all(childrenPromise)).filter(Boolean) as ComponentTreeNode[]

    const treeNode = {
      uid: functionalId,
      id: functionalId,
      tags: [
        {
          label: 'functional',
          textColor: 0x555555,
          backgroundColor: 0xeeeeee,
        },
      ],
      name: getInstanceName(instance),
      renderKey: getRenderKey(instance.key),
      children,
      hasChildren: !!children.length,
      inactive: false,
      isFragment: false, // TODO: Check what is it for.
      autoOpen: recursively,
    }
    return api.visitComponentTree(
      instance,
      treeNode,
      filter,
      appRecord?.options?.app,
    )
  }
  // instance._uid is not reliable in devtools as there
  // may be 2 roots with same _uid which causes unexpected
  // behaviour
  instance.__VUE_DEVTOOLS_UID__ = getUniqueId(instance, appRecord)

  // Dedupe
  if (captureIds.has(instance.__VUE_DEVTOOLS_UID__)) {
    return
  } else {
    captureIds.set(instance.__VUE_DEVTOOLS_UID__, undefined)
  }

  mark(instance)
  const name = getInstanceName(instance)

  const children = (await Promise.all((await getInternalInstanceChildren(instance))
    .filter(child => !isBeingDestroyed(child))
    .map(capture))).filter(Boolean)

  const ret: ComponentTreeNode = {
    uid: instance._uid,
    id: instance.__VUE_DEVTOOLS_UID__,
    name,
    renderKey: getRenderKey(instance.$vnode ? instance.$vnode.key : null),
    inactive: !!instance._inactive,
    isFragment: !!instance._isFragment,
    children,
    hasChildren: !!children.length,
    autoOpen: recursively,
    tags: [],
    meta: {},
  }

  if (instance._vnode && instance._vnode.children) {
    const vnodeChildren = await Promise.all(flatten(instance._vnode.children.map(captureChild)))
    ret.children = ret.children.concat(
      flatten<any>(vnodeChildren).filter(Boolean),
    )
    ret.hasChildren = !!ret.children.length
  }

  // ensure correct ordering
  const rootElements = getRootElementsFromComponentInstance(instance)
  const firstElement = rootElements[0]
  if (firstElement?.parentElement) {
    const parentInstance = instance.$parent
    const parentRootElements = parentInstance ? getRootElementsFromComponentInstance(parentInstance) : []
    let el = firstElement
    const indexList = []
    do {
      indexList.push(Array.from(el.parentElement.childNodes).indexOf(el))
      el = el.parentElement
    } while (el.parentElement && parentRootElements.length && !parentRootElements.includes(el))
    ret.domOrder = indexList.reverse()
  } else {
    ret.domOrder = [-1]
  }

  // check if instance is available in console
  const consoleId = consoleBoundInstances.indexOf(instance.__VUE_DEVTOOLS_UID__)
  ret.consoleId = consoleId > -1 ? '$vm' + consoleId : null

  // check router view
  const isRouterView2 = instance.$vnode?.data?.routerView
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
      backgroundColor: 0xff8344,
    })
  }
  return api.visitComponentTree(
    instance,
    ret,
    filter,
    appRecord?.options?.app,
  )
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
    applyPerfHooks(api, instance, appRecord.options.app)
    applyTrackingUpdateHook(api, instance)
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
    vnode,
  } as unknown as ComponentInstance)
}
