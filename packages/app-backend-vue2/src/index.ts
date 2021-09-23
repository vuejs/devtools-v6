import { DevtoolsBackend, BuiltinBackendFeature, BackendContext } from '@vue-devtools/app-backend-api'
import { backendInjections, getComponentName } from '@vue-devtools/shared-utils'
import { editState, getCustomInstanceDetails, getInstanceDetails } from './components/data'
import { getInstanceOrVnodeRect, findRelatedComponent, getRootElementsFromComponentInstance } from './components/el'
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
  canHandle (ctx: BackendContext) {
    return (ctx.currentAppRecord && ctx.currentAppRecord.options.version[0] === this.frameworkVersion.toString())
  },
  setup (api) {
    api.on.getAppRecordName((payload, ctx) => {
      if (payload.app.name) {
        payload.name = payload.app.name
      }
    })

    api.on.getAppRootInstance((payload, ctx) => {
      payload.root = payload.app
    })

    api.on.walkComponentTree(async (payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.componentTreeData = await walkTree(payload.componentInstance, payload.filter, ctx)
    })

    api.on.walkComponentParents((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.parentInstances = getComponentParents(payload.componentInstance, ctx)
    })

    api.on.inspectComponent((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      injectToUtils()
      payload.instanceData = getInstanceDetails(payload.componentInstance)
    })

    api.on.getComponentBounds((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.bounds = getInstanceOrVnodeRect(payload.componentInstance)
    })

    api.on.getComponentName((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      const instance = payload.componentInstance
      payload.name = instance.fnContext ? getComponentName(instance.fnOptions) : getInstanceName(instance)
    })

    api.on.getElementComponent((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.componentInstance = findRelatedComponent(payload.element)
    })

    api.on.editComponentState((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      editState(payload)
    })

    api.on.getComponentRootElements((payload, ctx) => {
      payload.rootElements = getRootElementsFromComponentInstance(payload.componentInstance)
    })

    api.on.getComponentDevtoolsOptions((payload, ctx) => {
      if (!this.canHandle(ctx)) return
      payload.options = payload.componentInstance.$options?.devtools
    })

    api.on.getComponentRenderCode((payload, ctx) => {
      if (!this.canHandle(ctx)) return
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
