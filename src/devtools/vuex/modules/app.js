const state = {
  message: '',
  tab: 'components'
}

const mutations = {
  SHOW_MESSAGE (state, message) {
    state.message = message
  },
  SWITCH_TAB (state, tab) {
    state.tab = tab
  },
  RECEIVE_INSTANCE_DETAILS (state, instance) {
    state.message = 'Instance selected: ' + instance.name
  }
}

export default {
  state,
  mutations
}
