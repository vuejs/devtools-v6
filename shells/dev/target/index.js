import Vue from 'vue'
import Target from './Target.vue'
import Other from './Other.vue'

new Vue({
  template: '<div><target msg="whaa" :obj="{a:1}"></target><other></other></div>',
  components: { Target, Other }
}).$mount().$appendTo('body')
