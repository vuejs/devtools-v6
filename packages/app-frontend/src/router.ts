import Vue from 'vue'
import VueRouter from 'vue-router'
import ComponentsInspector from './features/components/ComponentsInspector.vue'
import CustomInspector from './features/inspector/custom/CustomInspector.vue'
import Timeline from './features/timeline/Timeline.vue'
import Plugins from './features/plugin/Plugins.vue'
import PluginHome from './features/plugin/PluginHome.vue'
import PluginDetails from './features/plugin/PluginDetails.vue'
import GlobalSettings from './features/settings/GlobalSettings.vue'
import { BuiltinTabs, getStorage, setStorage } from '@vue-devtools/shared-utils'

Vue.use(VueRouter)

const RouterView = {
  render: h => h('router-view')
}

const routes = [
  {
    path: '/',
    redirect: {
      name: 'inspector-components'
    }
  },
  {
    path: '/app/:appId',
    component: RouterView,
    children: [
      {
        path: 'inspector',
        name: 'inspector',
        component: RouterView,
        children: [
          {
            path: 'components/:componentId?',
            name: 'inspector-components',
            component: ComponentsInspector,
            meta: {
              tab: BuiltinTabs.COMPONENTS
            }
          },
          {
            path: 'custom/:inspectorId',
            name: 'custom-inspector',
            component: CustomInspector,
            meta: {
              tab: route => `custom-inspector:${route.params.inspectorId}`
            }
          }
        ]
      },
      {
        path: 'timeline',
        name: 'timeline',
        component: Timeline,
        meta: {
          tab: BuiltinTabs.TIMELINE
        }
      },
      {
        path: 'plugins',
        component: Plugins,
        meta: {
          match: 'plugins',
          tab: BuiltinTabs.PLUGINS
        },
        children: [
          {
            path: '',
            name: 'plugins',
            component: PluginHome
          },
          {
            path: ':pluginId',
            name: 'plugin-details',
            component: PluginDetails,
            props: true
          }
        ]
      },
      {
        path: 'settings',
        name: 'global-settings',
        component: GlobalSettings,
        meta: {
          tab: BuiltinTabs.SETTINGS
        }
      }
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
]

const STORAGE_ROUTE = 'route'

export function createRouter () {
  const router = new VueRouter({
    routes
  })

  const previousRoute = getStorage(STORAGE_ROUTE)
  if (previousRoute) {
    router.push(previousRoute)
  }

  router.afterEach(to => {
    setStorage(STORAGE_ROUTE, to.fullPath)
  })

  return router
}
