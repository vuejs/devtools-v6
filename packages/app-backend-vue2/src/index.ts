import { defineBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
import { backendInjections, getComponentName } from '@vue-devtools/shared-utils'
import { ComponentInstance } from '@vue/devtools-api'
import { editState, getCustomInstanceDetails, getInstanceDetails } from './components/data'
import { getInstanceOrVnodeRect, findRelatedComponent, getRootElementsFromComponentInstance } from './components/el'
import { initPerf } from './components/perf.js'
import { getComponentParents, instanceMap, walkTree } from './components/tree'
import { initUpdateTracking } from './components/update-tracking.js'
import { getInstanceName } from './components/util'
import { wrapVueForEvents } from './events'
import { setupPlugin } from './plugin'

export const backend = defineBackend({
  frameworkVersion: 2,
  features: [
    BuiltinBackendFeature.FLUSH,
  ],
  setup (api) {
    api.on.getAppRecordName(payload => {
      if (payload.app.name) {
        payload.name = payload.app.name
      } else if (payload.app.$options.name) {
        payload.name = payload.app.$options.name
      }
    })

    api.on.getAppRootInstance(payload => {
      payload.root = payload.app as unknown as ComponentInstance
    })

    api.on.walkComponentTree(async (payload, ctx) => {
      payload.componentTreeData = await walkTree(payload.componentInstance, payload.filter, payload.recursively, api, ctx)
    })

    api.on.walkComponentParents((payload, ctx) => {
      payload.parentInstances = getComponentParents(payload.componentInstance, api, ctx)
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
      editState(payload, api.stateEditor)
    })

    api.on.getComponentRootElements(payload => {
      payload.rootElements = getRootElementsFromComponentInstance(payload.componentInstance)
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
    const { Vue } = appRecord.options.meta
    const app = appRecord.options.app

    // State editor overrides
    api.stateEditor.createDefaultSetCallback = state => {
      return (obj, field, value) => {
        if (state.remove || state.newKey) Vue.delete(obj, field)
        if (!state.remove) Vue.set(obj, state.newKey || field, value)
      }
    }

    // Utils
    injectToUtils()
    wrapVueForEvents(app, Vue, api.ctx)

    // Plugin
    setupPlugin(api, app, Vue)

    // Perf
    initPerf(api, app, Vue)
    // Update tracking
    initUpdateTracking(api, Vue)
  },
})

// @TODO refactor
function injectToUtils () {
  backendInjections.getCustomInstanceDetails = getCustomInstanceDetails
  backendInjections.getCustomObjectDetails = () => undefined
  backendInjections.instanceMap = instanceMap
  backendInjections.isVueInstance = val => val._isVue
}
