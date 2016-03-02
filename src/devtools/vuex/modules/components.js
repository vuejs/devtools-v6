const state = {
  filter: '',
  selected: null,
  inspectedInstance: {},
  instances: []
}

const mutations = {
  SET_SEARCH_FILTER (state, filter) {
    state.filter = filter
  },
  SELECT_INSTANCE () {

  }
}

export default {
  state,
  mutations
}
