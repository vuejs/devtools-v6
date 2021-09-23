import { DevtoolsBackend, BuiltinBackendFeature, BackendContext } from '@vue-devtools/app-backend-api'
import { ComponentWalker } from './components/tree'
import { editState, getInstanceDetails, getCustomInstanceDetails } from './components/data'
import { getInstanceName, getComponentInstances } from './components/util'
import { getComponentInstanceFromElement, getInstanceOrVnodeRect, getRootElementsFromComponentInstance } from './components/el'
import { backendInjections, HookEvents } from '@vue-devtools/shared-utils'

export const backend: DevtoolsBackend = {
  frameworkVersion: 3,

  availableFeatures: [
    BuiltinBackendFeature.COMPONENTS
  ],
  canHandle (ctx: BackendContext) {
    return (ctx.currentAppRecord && ctx.currentAppRecord.options.version[0] === this.frameworkVersion.toString())
  },
  setup (api) {
    api.on.getAppRecordName((payload, ctx) => {
      if (payload.app._component) {
        payload.name = payload.app._component.name
      }
    })

    api.on.getAppRootInstance((payload, ctx) => {
      if (payload.app._instance) {
        payload.root = payload.app._instance
      } else if (payload.app._container?._vnode?.component) {
        payload.root = payload.app._container?._vnode?.component
      }
    })

    api.on.walkComponentTree(async (payload, ctx) => {
      if (!this.canHandle(ctx)) return
      const walker = new ComponentWalker(payload.maxDepth, payload.filter, ctx)
      payload.componentTreeData = await walker.getComponentTree(payload.componentInstance)
    })

    api.on.walkComponentParents((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      const walker = new ComponentWalker(0, null, ctx)
      payload.parentInstances = walker.getComponentParents(payload.componentInstance)
    })

    api.on.inspectComponent((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      backendInjections.getCustomInstanceDetails = getCustomInstanceDetails
      backendInjections.instanceMap = ctx.currentAppRecord.instanceMap
      backendInjections.isVueInstance = val => val._ && Object.keys(val._).includes('vnode')
      payload.instanceData = getInstanceDetails(payload.componentInstance, ctx)
    })

    api.on.getComponentName((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.name = getInstanceName(payload.componentInstance)
    })

    api.on.getComponentBounds((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.bounds = getInstanceOrVnodeRect(payload.componentInstance)
    })

    api.on.getElementComponent((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.componentInstance = getComponentInstanceFromElement(payload.element)
    })

    api.on.getComponentInstances((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.componentInstances = getComponentInstances(payload.app)
    })

    api.on.getComponentRootElements((payload, ctx) => {
      payload.rootElements = getRootElementsFromComponentInstance(payload.componentInstance)
    })

    api.on.editComponentState((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      editState(payload, ctx)
    })

    api.on.getComponentDevtoolsOptions((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.options = payload.componentInstance.type?.devtools
    })

    api.on.getComponentRenderCode((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.code = !(payload.componentInstance.type instanceof Function) ? payload.componentInstance.render.toString() : payload.componentInstance.type.toString()
    })

    api.on.transformCall((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      if (payload.callName === HookEvents.COMPONENT_UPDATED) {
        const component = payload.inArgs[0]
        payload.outArgs = [
          component.appContext.app,
          component.uid,
          component.parent ? component.parent.uid : undefined,
          component
        ]
      }
    })

    // @TODO
  }
}
