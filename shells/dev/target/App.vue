<style lang="stylus" src="./global.styl"></style>

<template>
  <div class="inner">
    <hero></hero>
    <circular></circular>
    <vuex></vuex>
    <loop msg="hi"></loop>
    <events></events>
    <two-way></two-way>
    <shadow-dom></shadow-dom>
  </div>
</template>

<script>

import Hero from './misc/Hero.vue'
import Loop from './loop/Loop.vue'
import Vuex from './misc/Vuex.vue'
import Events from './events/Events.vue'
import Circular from './misc/Circular.vue'
import TwoWay from './misc/TwoWay.vue'
import ShadowDom from './misc/ShadowDom.vue'

export default {
  components: {
    Hero,
    Circular,
    Vuex,
    Loop,
    Events,
    TwoWay,
    ShadowDom
  }
}
</script>

<style lang="stylus">
#app-container
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  font-size: 15px
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  color: #2c3e50
  margin-top: 60px

.inner 
  max-width: 900px
  margin: 0 auto
</style>
