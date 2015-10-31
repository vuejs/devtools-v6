import Vue from 'vue'
import Target from './Target.vue'

new Vue({
  template: '<target></target>',
  components: { Target }
}).$mount().$appendTo('body')
