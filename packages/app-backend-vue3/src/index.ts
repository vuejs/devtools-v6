import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
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

  setup (api) {
    api.on.getAppRecordName(payload => {
      if (payload.app._component) {
        payload.name = payload.app._component.name
      }
    })

    api.on.getAppRootInstance(payload => {
      if (payload.app._instance) {
        payload.root = payload.app._instance
      } else if (payload.app._container?._vnode?.component) {
        payload.root = payload.app._container?._vnode?.component
      }
    })

    api.on.walkComponentTree(async (payload, ctx) => {
      const walker = new ComponentWalker(payload.maxDepth, payload.filter, ctx)
      payload.componentTreeData = await walker.getComponentTree(payload.componentInstance)
    })

    api.on.walkComponentParents((payload, ctx) => {
      const walker = new ComponentWalker(0, null, ctx)
      payload.parentInstances = walker.getComponentParents(payload.componentInstance)
    })

    api.on.inspectComponent((payload, ctx) => {
      backendInjections.getCustomInstanceDetails = getCustomInstanceDetails
      backendInjections.instanceMap = ctx.currentAppRecord.instanceMap
      backendInjections.isVueInstance = val => val._ && Object.keys(val._).includes('vnode')
      payload.instanceData = getInstanceDetails(payload.componentInstance, ctx)
    })

    api.on.getComponentName(payload => {
      payload.name = getInstanceName(payload.componentInstance)
    })

    api.on.getComponentBounds(payload => {
      payload.bounds = getInstanceOrVnodeRect(payload.componentInstance)
    })

    api.on.getElementComponent(payload => {
      payload.componentInstance = getComponentInstanceFromElement(payload.element)
    })

    api.on.getComponentInstances(payload => {
      payload.componentInstances = getComponentInstances(payload.app)
    })

    api.on.getComponentRootElements(payload => {
      payload.rootElements = getRootElementsFromComponentInstance(payload.componentInstance)
    })

    api.on.editComponentState((payload, ctx) => {
      editState(payload, ctx)
    })

    api.on.getComponentDevtoolsOptions(payload => {
      payload.options = payload.componentInstance.type.devtools
    })

    api.on.getComponentRenderCode(payload => {
      payload.code = payload.componentInstance.render.toString()
    })

    api.on.transformCall(payload => {
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
