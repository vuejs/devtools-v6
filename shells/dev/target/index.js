import Vue from 'vue'
import store from './store'
import Target from './Target.vue'
import Other from './Other.vue'
import Counter from './Counter.vue'

let items = []
for (var i = 0; i < 100; i++) {
  items.push({ id: i })
}

let circular = {}
circular.self = circular

new Vue({
  store,
  render (h) {
    return h('div', null, [
      h(Counter),
      h(Target, {props:{msg:'hi'}}),
      h(Other)
    ])
  },
  data: {
    obj: {
      items: items,
      circular
    }
  }
}).$mount('#app')
