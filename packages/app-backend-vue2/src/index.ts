import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
import { backendInjections, getComponentName } from '@vue-devtools/shared-utils'
import { editState, getCustomInstanceDetails, getInstanceDetails } from './components/data'
import { getInstanceOrVnodeRect, findRelatedComponent } from './components/el'
import { getComponentParents, instanceMap, walkTree } from './components/tree'
import { getInstanceName } from './components/util'
import { wrapVueForEvents } from './events'
import { setupPlugin } from './plugin'

export const backend: DevtoolsBackend = {
  frameworkVersion: 2,
  availableFeatures: [
    BuiltinBackendFeature.COMPONENTS,
    BuiltinBackendFeature.FLUSH
  ],
  setup (api) {
    api.on.getAppRecordName(payload => {
      if (payload.app.name) {
        payload.name = payload.app.name
      }
    })

    api.on.getAppRootInstance(payload => {
      payload.root = payload.app
    })

    api.on.walkComponentTree((payload, ctx) => {
      payload.componentTreeData = walkTree(payload.componentInstance, payload.filter, ctx)
    })

    api.on.walkComponentParents((payload, ctx) => {
      payload.parentInstances = getComponentParents(payload.componentInstance, ctx)
    })

    api.on.inspectComponent(payload => {
      injectToUtils()
      payload.instanceData = getInstanceDetails(payload.componentInstance)
    })

    api.on.getComponentBounds(payload => {
      payload.bounds = getInstanceOrVnodeRect(payload.componentInstance)
    })

    api.on.getComponentName(payload => {
      const instance = payload.componentInstance
      payload.name = instance.fnContext ? getComponentName(instance.fnOptions) : getInstanceName(instance)
    })

    api.on.getElementComponent(payload => {
      payload.componentInstance = findRelatedComponent(payload.element)
    })

    api.on.editComponentState(payload => {
      editState(payload)
    })

    api.on.getComponentRootElements(payload => {
      payload.rootElements = [payload.componentInstance.$el]
    })

    api.on.getComponentDevtoolsOptions(payload => {
      payload.options = payload.componentInstance.$options.devtools
    })

    api.on.getComponentRenderCode(payload => {
      payload.code = payload.componentInstance.$options.render.toString()
    })

    api.on.getComponentInstances(() => {
      console.warn('on.getComponentInstances is not implemented for Vue 2')
    })
  },

  setupApp (api, appRecord) {
    injectToUtils()
    const { Vue } = appRecord.options.meta
    const app = appRecord.options.app
    wrapVueForEvents(app, Vue, api.ctx)
    setupPlugin(api, app)
  }
}

function injectToUtils () {
  backendInjections.getCustomInstanceDetails = getCustomInstanceDetails
  backendInjections.instanceMap = instanceMap
  backendInjections.isVueInstance = val => val._isVue
}
