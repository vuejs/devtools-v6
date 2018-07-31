import Vue from 'vue'
import VueRouter from 'vue-router'

import ComponentsTab from './views/components/ComponentsTab.vue'
import VuexTab from './views/vuex/VuexTab.vue'
import EventsTab from './views/events/EventsTab.vue'
import SettingsTab from './views/settings/SettingsTab.vue'

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
