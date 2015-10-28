import Vue from 'vue'
import targetOptions from './Target.vue'

const Target = Vue.extend(targetOptions)
new Target().$mount().$appendTo('body')
