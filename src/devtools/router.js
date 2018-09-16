import Vue from 'vue'
import VueRouter from 'vue-router'

import ComponentsTab from './views/components/ComponentsTab.vue'
import VuexTab from './views/vuex/VuexTab.vue'
import EventsTab from './views/events/EventsTab.vue'
import PerfTab from './views/perf/PerfTab.vue'
import ComponentRenderStats from './views/perf/ComponentRenderStats.vue'
import FramerateGraph from './views/perf/FramerateGraph.vue'
import SettingsTab from './views/settings/SettingsTab.vue'
import RouterTab from './views/router/RouterTab.vue'
import RoutesTab from './views/routes/RoutesTab.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: { name: 'components' }
  },
  {
    path: '/components',
    name: 'components',
    component: ComponentsTab
  },
  {
    path: '/vuex',
    name: 'vuex',
    component: VuexTab
  },
  {
    path: '/events',
    name: 'events',
    component: EventsTab
  },
  {
    path: '/router',
    name: 'router',
    component: RouterTab
  },
  {
    path: '/routes',
    name: 'routes',
    component: RoutesTab
  },
  {
    path: '/perf',
    component: PerfTab,
    name: 'perf',
    children: [
      {
        path: 'fps',
        name: 'fps',
        component: FramerateGraph
      },
      {
        path: 'component-render',
        name: 'component-render',
        component: ComponentRenderStats
      }
    ]
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsTab
  },
  {
    path: '*',
    redirect: '/'
  }
]

const router = new VueRouter({
  routes
})

export default router
