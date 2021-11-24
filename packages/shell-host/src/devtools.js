import Vue from 'vue'
import DevIframe from './DevIframe.vue'

const app = new Vue(DevIframe)
app.$mount('#iframe-target')
