const state = {
  initial: null,
  base: null,
  activeIndex: -1,
  history: []
}

const mutations = {
  'vuex/INIT' (state, initialState) {
    state.initial = state.base = initialState
  },
  'vuex/RECEIVE_MUTATION' (state, entry) {
    state.history.push(entry)
    state.activeIndex = state.history.length - 1
  },
  'vuex/COMMIT' (state) {
    state.base = state.history[state.history.length - 1].state
    reset(state)
  },
  'vuex/REVERT' (state) {
    reset(state)
  },
  'vuex/RESET' (state) {
    state.base = state.initial
    reset(state)
  },
  'vuex/STEP' (state, n) {
    state.activeIndex = n
  }
}

function reset (state) {
  state.history = []
  state.activeIndex = -1
}

export default {
  state,
  mutations
}
