import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import store from './store'
import router from './router'
import Target from './Target.vue'
import Other from './Other.vue'
import Counter from './Counter.vue'
import NativeTypes from './NativeTypes.vue'
import Events from './Events.vue'
import MyClass from './MyClass.js'
import Router from './Router.vue'

sync(store, router)

let items = []
for (var i = 0; i < 100; i++) {
  items.push({ id: i })
}

let circular = {}
circular.self = circular

new Vue({
  name: 'Root',
  store,
  router,
  render (h) {
    return h('div', null, [
      h(Counter),
      h(Target, {props:{msg: 'hi', ins: new MyClass()}}),
      h(Other),
      h(Events),
      h(NativeTypes),
      h(Router)
    ])
  },
  data: {
    obj: {
      items: items,
      circular
    }
  }
}).$mount('#app')

new Vue({
  name: 'App2',
  render (h) {
    return h('div', { id: 'app2' }, [
      h({
        data () {
          return { foo: 'bar' }
        },
        beforeCreate () {
          this._routerRoot = null
        },
        render (h) {
          return h('div', [
            h('h1', 'App2'),
            h('p', this.foo)
          ])
        }
      })
    ])
  }
}).$mount('#app2')

// custom element instance
const ce = document.querySelector('#shadow')
if (ce.attachShadow) {
  const shadowRoot = ce.attachShadow({ mode: 'open' })

  const ceVM = new Vue({
    name: 'Shadow',
    render (h) {
      return h('h2', 'Inside Shadow DOM!')
    }
  }).$mount()

  shadowRoot.appendChild(ceVM.$el)
}
