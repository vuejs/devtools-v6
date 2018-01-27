import Vue from 'vue'
import VueRouter from 'vue-router'
import Page1 from './Page1.vue'
import Page2 from './Page2.vue'

Vue.use(VueRouter)

const routes = [
  { path: '/', name: 'page1', component: Page1 },
  { path: '/page2', name: 'page2', component: Page2 }
]

const router = new VueRouter({
  routes
})

export default router
