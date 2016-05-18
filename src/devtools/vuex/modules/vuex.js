const state = {
  hasVuex: false,
  initial: null,
  base: null,
  activeIndex: -1,
  history: [],
  initialCommit: Date.now(),
  lastCommit: Date.now(),
  showStateCopiedMessage: false,
  showBadJsonMessage: false,
  showImportStatePopup: false
}

const mutations = {
  'vuex/INIT' (state, initialState) {
    state.initial = state.base = initialState
    state.hasVuex = true
  },
  'vuex/RECEIVE_MUTATION' (state, entry) {
    state.history.push(entry)
    state.activeIndex = state.history.length - 1
  },
  'vuex/COMMIT_ALL' (state) {
    state.base = state.history[state.history.length - 1].state
    state.lastCommit = Date.now()
    reset(state)
  },
  'vuex/REVERT_ALL' (state) {
    reset(state)
  },
  'vuex/COMMIT_SELECTED' (state) {
    state.base = state.history[state.activeIndex].state
    state.lastCommit = Date.now()
    state.history = state.history.slice(state.activeIndex + 1)
    state.activeIndex = -1
  },
  'vuex/REVERT_SELECTED' (state) {
    state.history = state.history.slice(0, state.activeIndex)
    state.activeIndex--
  },
  'vuex/RESET' (state) {
    state.base = state.initial
    state.lastCommit = state.initialCommit
    reset(state)
  },
  'vuex/STEP' (state, n) {
    state.activeIndex = n
  },
  'vuex/SHOW_STATE_COPIED_MESSAGE' (state) {
    state.showStateCopiedMessage = true
  },
  'vuex/HIDE_STATE_COPIED_MESSAGE' (state) {
    state.showStateCopiedMessage = false
  },
  'vuex/SHOW_BAD_JSON_MESSAGE' (state) {
    state.showBadJsonMessage = true
  },
  'vuex/HIDE_BAD_JSON_MESSAGE' (state) {
    state.showBadJsonMessage = false
  },
  'vuex/SHOW_IMPORT_STATE_POPUP' (state) {
    state.showImportStatePopup = true
  },
  'vuex/HIDE_IMPORT_STATE_POPUP' (state) {
    state.showImportStatePopup = false
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
