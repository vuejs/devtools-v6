import Vue from 'vue'
import store from './store'
import Target from './Target.vue'
import Other from './Other.vue'
import Counter from './Counter.vue'
import Events from './Events.vue'
import IndexRoute from './router/IndexRoute.vue'
import RouteOne from './router/RouteOne.vue'
import RouteTwo from './router/RouteTwo.vue'
import RouteWithParams from './router/RouteWithParams.vue'
import NamedRoute from './router/NamedRoute.vue'
import RouteWithQuery from './router/RouteWithQuery.vue'
import RouteWithBeforeEnter from './router/RouteWithBeforeEnter.vue'
import RouteWithAlias from './router/RouteWithAlias.vue'
import RouteWithProps from './router/RouteWithProps.vue'

import VueRouter from 'vue-router'

Vue.use(VueRouter)

const DynamicComponent = { 
  template: '<div>Hello from dynamic component</div>' 
}

const routes = [
  { path: '/route-one', component: RouteOne },
  { path: '/route-two', component: RouteTwo },
  { path: '/route-with-params/:username/:id', component: RouteWithParams },
  { path: '/route-named', component: NamedRoute, name: 'NamedRoute' },
  { path: '/route-with-query', component: RouteWithQuery },
  { path: '/route-with-before-enter', component: RouteWithBeforeEnter, beforeEnter: (to, from, next) => {
    next()
  }},
  { path: '/route-with-redirect', redirect: '/route-one' },
  { path: '/route-with-alias', component: RouteWithAlias, alias: '/this-is-the-alias' },
  { path: '/route-with-dynamic-component', component: DynamicComponent },
  { path: '/route-with-props', component: RouteWithProps, props: {
    username: 'My Username',
    id: 99
  }},
  { path: '/route-with-props-default', component: RouteWithProps }
]

const router = new VueRouter({
  routes
})

let items = []
for (var i = 0; i < 100; i++) {
  items.push({ id: i })
}

let circular = {}
circular.self = circular

new Vue({
  store,
  router,
  render (h) {
    return h('div', null, [
      h(Counter),
      h(Target, {props:{msg:'hi'}}),
      h(Other),
      h(Events),
      h(IndexRoute)
    ])
  },
  data: {
    obj: {
      items: items,
      circular
    }
  }
}).$mount('#app')

// custom element instance
const ce = document.querySelector('#shadow')
const shadowRoot = ce.attachShadow({ mode: 'open' })

const ceVM = new Vue({
  name: 'Shadow',
  render (h) {
    return h('h2', 'Inside Shadow DOM!')
  }
}).$mount()

shadowRoot.appendChild(ceVM.$el)
