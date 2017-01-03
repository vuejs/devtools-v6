import Vue from 'vue'
import Vuex from 'vuex'
import app from './app-module'
import components from 'views/components/module'
import vuex from 'views/vuex/module'
import events from 'views/events/module'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    components,
    vuex,
    events
  }
})

export default store

if (module.hot) {
  module.hot.accept([
    './app-module',
    'views/components/module',
    'views/vuex/module',
    'views/events/module'
  ], () => {
    try {
      store.hotUpdate({
        modules: {
          app: require('./app-module').default,
          components: require('views/components/module').default,
          vuex: require('views/vuex/module').default,
          events: require('views/events/module').default
        }
      })
    } catch (e) {
      console.log(e.stack)
    }
  })
}
