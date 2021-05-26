import { isBeingDestroyed, getUniqueComponentId, getInstanceName, getRenderKey, isFragment } from './util'
import { ComponentFilter } from './filter'
import { BackendContext } from '@vue-devtools/app-backend-api'
import { ComponentTreeNode } from '@vue/devtools-api'
import { getInstanceOrVnodeRect } from './el'

export class ComponentWalker {
  ctx: BackendContext
  maxDepth: number
  componentFilter: ComponentFilter
  // Dedupe instances
  // Some instances may be both on a component and on a child abstract/functional component
  captureIds: Map<string, undefined>

  constructor (maxDepth: number, filter: string, ctx: BackendContext) {
    this.ctx = ctx
    this.maxDepth = maxDepth
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
      return this.findQualifiedChildrenFromList(this.getInternalInstanceChildren(instance.subTree), depth)
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
  private getInternalInstanceChildren (subTree) {
    const list = []
    if (subTree.component) {
      list.push(subTree.component)
    }
    if (subTree.suspense) {
      list.push(...this.getInternalInstanceChildren(subTree.suspense.activeBranch))
    }
    if (Array.isArray(subTree.children)) {
      subTree.children.forEach(childSubTree => {
        if (childSubTree.component) {
          list.push(childSubTree.component)
        } else {
          list.push(...this.getInternalInstanceChildren(childSubTree))
        }
      })
    }
    return list.filter(child => !isBeingDestroyed(child) && !child.type.devtools?.hide)
  }

  private captureId (instance) {
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
    const id = this.captureId(instance)

    const name = getInstanceName(instance)

    const children = this.getInternalInstanceChildren(instance.subTree)
      .filter(child => !isBeingDestroyed(child))

    const treeNode: ComponentTreeNode = {
      uid: instance.uid,
      id,
      name,
      renderKey: getRenderKey(instance.vnode ? instance.vnode.key : null),
      inactive: !!instance.isDeactivated,
      hasChildren: !!children.length,
      children: [],
      isFragment: isFragment(instance),
      tags: []
    }

    // capture children
    if (depth < this.maxDepth) {
      treeNode.children = await Promise.all(children
        .map((child, index, list) => this.capture(child, list, depth + 1))
        .filter(Boolean))
    }

    // keep-alive
    if (instance.type.__isKeepAlive && instance.__v_cache) {
      const cachedComponents = Array.from(instance.__v_cache.values()).map((vnode: any) => vnode.component).filter(Boolean)
      for (const child of cachedComponents) {
        if (!children.includes(child)) {
          const node = await this.capture(child, null, depth + 1)
          if (node) {
            node.inactive = true
            treeNode.children.push(node)
          }
        }
      }
    }

    // record screen position to ensure correct ordering
    if ((!list || list.length > 1) && !instance._inactive) {
      const rect = getInstanceOrVnodeRect(instance)
      treeNode.positionTop = rect ? rect.top : Infinity
    }

    if (instance.suspense) {
      treeNode.tags.push({
        label: 'suspense',
        backgroundColor: 0x7d7dd7,
        textColor: 0xffffff
      })
    }

    return this.ctx.api.visitComponentTree(instance, treeNode, this.componentFilter.filter, this.ctx.currentAppRecord.options.app)
  }

  /**
   * Mark an instance as captured and store it in the instance map.
   *
   * @param {Vue} instance
   */
  private mark (instance) {
    const instanceMap = this.ctx.currentAppRecord.instanceMap
    if (!instanceMap.has(instance.__VUE_DEVTOOLS_UID__)) {
      instanceMap.set(instance.__VUE_DEVTOOLS_UID__, instance)
    }
  }
}
