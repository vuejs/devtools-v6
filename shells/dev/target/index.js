import Vue from 'vue'
import Target from './Target.vue'
import Other from './Other.vue'

let items = []
for (var i = 0; i < 100; i++) {
  items.push({ id: i })
}

new Vue({
  template: '<div><target msg="whaa" :obj="obj"></target><other></other></div>',
  components: { Target, Other },
  data: {
    obj: {
      items: items
    }
  }
}).$mount().$appendTo('body')
