import Vue from 'vue'
import VueRouter from 'vue-router'
import ComponentsInspector from './features/components/ComponentsInspector.vue'
import Timeline from './features/timeline/Timeline.vue'
import GlobalSettings from './features/settings/GlobalSettings.vue'

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
            component: ComponentsInspector
          }
        ]
      },
      {
        path: 'timeline',
        name: 'timeline',
        component: Timeline
      },
      {
        path: 'settings',
        name: 'global-settings',
        component: GlobalSettings
      }
    ]
  },
  {
    path: '*',
    redirect: '/'
  }
]

export function createRouter () {
  const router = new VueRouter({
    routes
  })
  return router
}
