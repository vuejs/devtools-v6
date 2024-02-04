import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'
import { BuiltinTabs, getStorage, setStorage } from '@vue-devtools/shared-utils'
import ComponentsInspector from './features/components/ComponentsInspector.vue'
import CustomInspector from './features/inspector/custom/CustomInspector.vue'
import Timeline from './features/timeline/Timeline.vue'
import Plugins from './features/plugin/Plugins.vue'
import PluginHome from './features/plugin/PluginHome.vue'
import PluginDetails from './features/plugin/PluginDetails.vue'
import GlobalSettings from './features/settings/GlobalSettings.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: {
      // An error will be thrown if param id is not provided, provide a default value to avoid this.
      // Ref: https://github.com/vuejs/router/issues/845
      path: '/app/init/inspector/components',
    },
  },
  {
    path: '/app/:appId',
    children: [
      {
        path: 'inspector',
        name: 'inspector',
        children: [
          {
            path: 'components/:componentId?',
            name: 'inspector-components',
            component: ComponentsInspector,
            meta: {
              tab: BuiltinTabs.COMPONENTS,
            },
          },
          {
            path: 'custom/:inspectorId',
            name: 'custom-inspector',
            component: CustomInspector,
            meta: {
              tab: (route: RouteLocationNormalized) => `custom-inspector:${route.params.inspectorId}`,
            },
          },
        ],
      },
      {
        path: 'timeline',
        name: 'timeline',
        component: Timeline,
        meta: {
          tab: BuiltinTabs.TIMELINE,
        },
      },
      {
        path: 'plugins',
        component: Plugins,
        meta: {
          match: 'plugins',
          tab: BuiltinTabs.PLUGINS,
        },
        children: [
          {
            path: '',
            name: 'plugins',
            component: PluginHome,
          },
          {
            path: ':pluginId',
            name: 'plugin-details',
            component: PluginDetails,
            props: true,
          },
        ],
      },
      {
        path: 'settings',
        name: 'global-settings',
        component: GlobalSettings,
        meta: {
          tab: BuiltinTabs.SETTINGS,
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const STORAGE_ROUTE = 'route'

export function createRouterInstance() {
  const router = createRouter({
    history: createWebHashHistory('/'),
    routes,
  })

  const previousRoute = getStorage(STORAGE_ROUTE)
  if (previousRoute) {
    router.push(previousRoute)
  }

  router.afterEach((to) => {
    setStorage(STORAGE_ROUTE, to.fullPath)
  })

  return router
}
