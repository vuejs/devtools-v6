import { isBeingDestroyed, getUniqueComponentId, getInstanceName, getRenderKey, isFragment } from './util'
import { ComponentFilter } from './filter'
import { BackendContext, DevtoolsApi } from '@vue-devtools/app-backend-api'
import { ComponentTreeNode } from '@vue/devtools-api'
import { getRootElementsFromComponentInstance } from './el'

export class ComponentWalker {
  ctx: BackendContext
  api: DevtoolsApi
  maxDepth: number
  recursively: boolean
  componentFilter: ComponentFilter
  // Dedupe instances
  // Some instances may be both on a component and on a child abstract/functional component
  captureIds: Map<string, undefined>

  constructor (maxDepth: number, filter: string, recursively: boolean, api: DevtoolsApi, ctx: BackendContext) {
    this.ctx = ctx
    this.api = api
    this.maxDepth = maxDepth
    this.recursively = recursively
    this.componentFilter = new ComponentFilter(filter)
  }

  getComponentTree (instance: any): Promise<ComponentTreeNode[]> {
    this.captureIds = new Map()
    return this.findQualifiedChildren(instance, 0)
  }

  getComponentParents (instance: any) {
    this.captureIds = new Map()
    const parents = []
    this.captureId(instance)
    let parent = instance
    while ((parent = parent.parent)) {
      this.captureId(parent)
      parents.push(parent)
    }
    return parents
  }

  /**
   * Find qualified children from a single instance.
   * If the instance itself is qualified, just return itself.
   * This is ok because [].concat works in both cases.
   *
   * @param {Vue|Vnode} instance
   * @return {Vue|Array}
   */
  private async findQualifiedChildren (instance: any, depth: number): Promise<ComponentTreeNode[]> {
    if (this.componentFilter.isQualified(instance) && !instance.type.devtools?.hide) {
      return [await this.capture(instance, null, depth)]
    } else if (instance.subTree) {
      // TODO functional components
      const list = this.isKeepAlive(instance)
        ? this.getKeepAliveCachedInstances(instance)
        : this.getInternalInstanceChildren(instance.subTree)
      return this.findQualifiedChildrenFromList(list, depth)
    } else {
      return []
    }
  }

  /**
   * Iterate through an array of instances and flatten it into
   * an array of qualified instances. This is a depth-first
   * traversal - e.g. if an instance is not matched, we will
   * recursively go deeper until a qualified child is found.
   *
   * @param {Array} instances
   * @return {Array}
   */
  private async findQualifiedChildrenFromList (instances, depth: number): Promise<ComponentTreeNode[]> {
    instances = instances
      .filter(child => !isBeingDestroyed(child) && !child.type.devtools?.hide)
    if (!this.componentFilter.filter) {
      return Promise.all(instances.map((child, index, list) => this.capture(child, list, depth)))
    } else {
      return Array.prototype.concat.apply([], await Promise.all(instances.map(i => this.findQualifiedChildren(i, depth))))
    }
  }

  /**
   * Get children from a component instance.
   */
  private getInternalInstanceChildren (subTree, suspense = null) {
    const list = []
    if (subTree) {
      if (subTree.component) {
        !suspense ? list.push(subTree.component) : list.push({ ...subTree.component, suspense })
      } else if (subTree.suspense) {
        const suspenseKey = !subTree.suspense.isInFallback ? 'suspense default' : 'suspense fallback'
        list.push(...this.getInternalInstanceChildren(subTree.suspense.activeBranch, { ...subTree.suspense, suspenseKey }))
      } else if (Array.isArray(subTree.children)) {
        subTree.children.forEach(childSubTree => {
          if (childSubTree.component) {
            !suspense ? list.push(childSubTree.component) : list.push({ ...childSubTree.component, suspense })
          } else {
            list.push(...this.getInternalInstanceChildren(childSubTree, suspense))
          }
        })
      }
    }
    return list.filter(child => !isBeingDestroyed(child) && !child.type.devtools?.hide)
  }

  private captureId (instance): string {
    if (!instance) return null

    // instance.uid is not reliable in devtools as there
    // may be 2 roots with same uid which causes unexpected
    // behaviour
    const id = instance.__VUE_DEVTOOLS_UID__ != null ? instance.__VUE_DEVTOOLS_UID__ : getUniqueComponentId(instance, this.ctx)
    instance.__VUE_DEVTOOLS_UID__ = id

    // Dedupe
    if (this.captureIds.has(id)) {
      return
    } else {
      this.captureIds.set(id, undefined)
    }

    this.mark(instance)

    return id
  }

  /**
   * Capture the meta information of an instance. (recursive)
   *
   * @param {Vue} instance
   * @return {Object}
   */
  private async capture (instance: any, list: any[], depth: number): Promise<ComponentTreeNode> {
    if (!instance) return null

    const id = this.captureId(instance)

    const name = getInstanceName(instance)

    const children = this.getInternalInstanceChildren(instance.subTree)
      .filter(child => !isBeingDestroyed(child))

    const parents = this.getComponentParents(instance) || []

    const inactive = !!instance.isDeactivated || parents.some(parent => parent.isDeactivated)

    const treeNode: ComponentTreeNode = {
      uid: instance.uid,
      id,
      name,
      renderKey: getRenderKey(instance.vnode ? instance.vnode.key : null),
      inactive,
      hasChildren: !!children.length,
      children: [],
      isFragment: isFragment(instance),
      tags: typeof instance.type !== 'function'
        ? []
        : [
            {
              label: 'functional',
              textColor: 0x555555,
              backgroundColor: 0xeeeeee,
            },
          ],
      autoOpen: this.recursively,
    }

    // capture children
    if (depth < this.maxDepth || instance.type.__isKeepAlive || parents.some(parent => parent.type.__isKeepAlive)) {
      treeNode.children = await Promise.all(children
        .map((child, index, list) => this.capture(child, list, depth + 1))
        .filter(Boolean))
    }

    // keep-alive
    if (this.isKeepAlive(instance)) {
      const cachedComponents = this.getKeepAliveCachedInstances(instance)
      const childrenIds = children.map(child => child.__VUE_DEVTOOLS_UID__)
      for (const cachedChild of cachedComponents) {
        if (!childrenIds.includes(cachedChild.__VUE_DEVTOOLS_UID__)) {
          const node = await this.capture({ ...cachedChild, isDeactivated: true }, null, depth + 1)
          if (node) {
            treeNode.children.push(node)
          }
        }
      }
    }

    // ensure correct ordering
    const rootElements = getRootElementsFromComponentInstance(instance)
    const firstElement = rootElements[0]
    if (firstElement?.parentElement) {
      const parentInstance = instance.parent
      const parentRootElements = parentInstance ? getRootElementsFromComponentInstance(parentInstance) : []
      let el = firstElement
      const indexList = []
      do {
        indexList.push(Array.from(el.parentElement.childNodes).indexOf(el))
        el = el.parentElement
      } while (el.parentElement && parentRootElements.length && !parentRootElements.includes(el))
      treeNode.domOrder = indexList.reverse()
    } else {
      treeNode.domOrder = [-1]
    }

    if (instance.suspense?.suspenseKey) {
      treeNode.tags.push({
        label: instance.suspense.suspenseKey,
        backgroundColor: 0xe492e4,
        textColor: 0xffffff,
      })
      // update instanceMap
      this.mark(instance, true)
    }

    return this.api.visitComponentTree(instance, treeNode, this.componentFilter.filter, this.ctx.currentAppRecord.options.app)
  }

  /**
   * Mark an instance as captured and store it in the instance map.
   *
   * @param {Vue} instance
   */
  private mark (instance, force = false) {
    const instanceMap = this.ctx.currentAppRecord.instanceMap
    if (force || !instanceMap.has(instance.__VUE_DEVTOOLS_UID__)) {
      instanceMap.set(instance.__VUE_DEVTOOLS_UID__, instance)
    }
  }

  private isKeepAlive (instance) {
    return instance.type.__isKeepAlive && instance.__v_cache
  }

  private getKeepAliveCachedInstances (instance) {
    return Array.from(instance.__v_cache.values()).map((vnode: any) => vnode.component).filter(Boolean)
  }
}
