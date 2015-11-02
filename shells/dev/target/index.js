import Vue from 'vue'
import Target from './Target.vue'
import Other from './Other.vue'

new Vue({
  template: '<div><target msg="whaa"></target><other></other></div>',
  components: { Target, Other }
}).$mount().$appendTo('body')
