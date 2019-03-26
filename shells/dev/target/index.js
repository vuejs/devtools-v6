import Vue from 'vue'
import store from './store'
import Target from './Target.vue'
import Other from './Other.vue'
import Counter from './Counter.vue'
import NativeTypes from './NativeTypes.vue'
import Events from './Events.vue'
import MyClass from './MyClass.js'
import Router from './Router.vue'
import router from './router'

window.VUE_DEVTOOLS_CONFIG = {
  openInEditorHost: '/'
}

const items = []
for (var i = 0; i < 100; i++) {
  items.push({ id: i })
}

const circular = {}
circular.self = circular

new Vue({
  store,
  router,
  render (h) {
    return h('div', null, [
      h(Counter),
      h(Target, { props: { msg: 'hi', ins: new MyClass() }}),
      h(Other),
      h(Events, { key: 'foo' }),
      h(NativeTypes, { key: new Date() }),
      h(Router, { key: [] })
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
