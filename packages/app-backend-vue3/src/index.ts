import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
import { ComponentWalker } from './components/tree'
import { getInstanceDetails } from './components/data'
import { getComponentName, getInstanceOrVnodeRect } from './components/util'

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
      if (payload.app._container?._vnode?.component) {
        payload.root = payload.app._container?._vnode?.component
      }
    })

    api.on.walkComponentTree((payload, ctx) => {
      const walker = new ComponentWalker(payload.maxDepth, ctx)
      payload.componentTreeData = walker.getComponentTree(payload.componentInstance)
    })

    api.on.inspectComponent(async (payload, ctx) => {
      payload.instanceData = await getInstanceDetails(payload.componentInstance, ctx)
    })

    api.on.getComponentName(async payload => {
      payload.name = await getComponentName(payload.componentInstance.type)
    })

    api.on.getComponentBounds(async payload => {
      payload.bounds = await getInstanceOrVnodeRect(payload.componentInstance)
    })

    // @TODO
  }
}
