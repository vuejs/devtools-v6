import { DevtoolsBackend, BuiltinBackendFeature } from '@vue-devtools/app-backend-api'
import { backendInjections, getComponentName } from '@vue-devtools/shared-utils'
import { getCustomInstanceDetails, getInstanceDetails } from './components/data'
import { getInstanceOrVnodeRect, findRelatedComponent } from './components/el'
import { instanceMap, walkTree } from './components/tree'
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

    api.on.inspectComponent(payload => {
      injectToUtils()
      payload.instanceData = getInstanceDetails(payload.componentInstance)
    })

    api.on.getComponentBounds(payload => {
      payload.bounds = getInstanceOrVnodeRect(payload.componentInstance)
      console.log(payload.componentInstance, payload.bounds)
    })

    api.on.getComponentName(payload => {
      const instance = payload.componentInstance
      payload.name = instance.fnContext ? getComponentName(instance.fnOptions) : getInstanceName(instance)
    })

    api.on.getElementComponent(payload => {
      payload.componentInstance = findRelatedComponent(payload.element)
    })

    // @TODO
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
}
