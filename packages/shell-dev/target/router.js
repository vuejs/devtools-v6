import Vue from 'vue'
import VueRouter from 'vue-router'
import RouteOne from './router/RouteOne.vue'
import RouteTwo from './router/RouteTwo.vue'
import RouteWithParams from './router/RouteWithParams.vue'
import NamedRoute from './router/NamedRoute.vue'
import RouteWithQuery from './router/RouteWithQuery.vue'
import RouteWithBeforeEnter from './router/RouteWithBeforeEnter.vue'
import RouteWithAlias from './router/RouteWithAlias.vue'
import RouteWithProps from './router/RouteWithProps.vue'
import ParentRoute from './router/ParentRoute.vue'
import ChildRoute from './router/ChildRoute.vue'

Vue.use(VueRouter)

const DynamicComponent = {
  render: (h) => h('div', 'Hello from dynamic component')
}

const routes = [
  { path: '/route-one', component: RouteOne },
  { path: '/route-two', component: RouteTwo },
  { path: '/route-with-params/:username/:id', component: RouteWithParams },
  { path: '/route-named', component: NamedRoute, name: 'NamedRoute' },
  { path: '/route-with-query', component: RouteWithQuery },
  { path: '/route-with-before-enter',
    component: RouteWithBeforeEnter,
    beforeEnter: (to, from, next) => {
      next()
    }},
  { path: '/route-with-redirect', redirect: '/route-one' },
  { path: '/route-with-alias', component: RouteWithAlias, alias: '/this-is-the-alias' },
  { path: '/route-with-dynamic-component', component: DynamicComponent, props: true },
  { path: '/route-with-props',
    component: RouteWithProps,
    props: {
      username: 'My Username',
      id: 99
    }},
  { path: '/route-with-props-default', component: RouteWithProps },
  { path: '/route-parent',
    component: ParentRoute,
    children: [
      { path: '/route-child', component: ChildRoute }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
