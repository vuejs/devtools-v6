import { parse } from '../../../../util'
import * as actions from './actions'

const state = {
  hasVuex: false,
  initial: null,
  base: null,
  activeIndex: -1,
  history: [],
  initialCommit: Date.now(),
  lastCommit: Date.now()
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
  }
}

function reset (state) {
  state.history = []
  state.activeIndex = -1
}

const getters = {
  vuexActiveState ({ base, history, activeIndex }) {
    const entry = history[activeIndex]
    const res = {}
    if (entry) {
      res.type = entry.mutation.type
      if (entry.mutation.payload) {
        res.payload = parse(entry.mutation.payload)
      }
    }
    res.state = parse(entry ? entry.state : base)
    return res
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
