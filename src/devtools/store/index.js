import Vue from 'vue'
import Vuex from 'vuex'
import components from 'views/components/module'
import vuex from 'views/vuex/module'
import events from 'views/events/module'
import router from 'views/router/module'
import routes from 'views/routes/module'
import perf from 'views/perf/module'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    message: '',
    view: 'vertical'
  },
  mutations: {
    SHOW_MESSAGE (state, message) {
      state.message = message
    },
    SWITCH_VIEW (state, view) {
      state.view = view
    },
    RECEIVE_INSTANCE_DETAILS (state, instance) {
      state.message = 'Instance selected: ' + instance.name
    }
  },
  modules: {
    components,
    vuex,
    events,
    router,
    routes,
    perf
  }
})

export default store

if (module.hot) {
  module.hot.accept([
    'views/components/module',
    'views/vuex/module',
    'views/events/module',
    'views/router/module',
    'views/routes/module',
    'views/perf/module'
  ], () => {
    try {
      store.hotUpdate({
        modules: {
          components: require('views/components/module').default,
          vuex: require('views/vuex/module').default,
          events: require('views/events/module').default,
          router: require('views/router/module').default,
          routes: require('views/routes/module').default,
          perf: require('views/perf/module').default
        }
      })
    } catch (e) {
      console.log(e.stack)
    }
  })
}
