import Vue from 'vue'
import Vuex from 'vuex'
import components from 'views/components/module'
import vuex from 'views/vuex/module'
import events from 'views/events/module'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    message: '',
    tab: 'components',
    view: 'vertical'
  },
  mutations: {
    SHOW_MESSAGE (state, message) {
      state.message = message
    },
    SWITCH_TAB (state, tab) {
      state.tab = tab
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
    events
  }
})

export default store

if (module.hot) {
  module.hot.accept([
    'views/components/module',
    'views/vuex/module',
    'views/events/module'
  ], () => {
    try {
      store.hotUpdate({
        modules: {
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
