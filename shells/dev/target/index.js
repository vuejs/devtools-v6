import Vue from 'vue'
import Target from './Target.vue'

new Vue({
  template: '<div><target></target><target></target></div>',
  components: { Target }
}).$mount().$appendTo('body')
