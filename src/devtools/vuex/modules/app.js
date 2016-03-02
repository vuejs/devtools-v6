const state = {
  message: '',
  tab: 'components'
}

const mutations = {
  SET_MESSAGE (state, message) {
    state.message = message
  },
  SWITCH_TAB (state, tab) {
    state.tab = tab
  },
  SELECT_INSTANCE (state, target) {
    state.message = 'Instance selected: ' + target.instance.name
  }
}

export default {
  state,
  mutations
}
