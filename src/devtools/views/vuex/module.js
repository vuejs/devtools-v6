import { parse } from 'src/util'
import * as actions from './actions'

const state = {
  hasVuex: false,
  initial: null,
  base: null,
  inspectedIndex: -1,
  activeIndex: -1,
  history: [],
  initialCommit: Date.now(),
  lastCommit: Date.now()
}

const mutations = {
  'INIT' (state, initialState) {
    state.initial = state.base = initialState
    state.hasVuex = true
    reset(state)
  },
  'RECEIVE_MUTATION' (state, entry) {
    state.history.push(entry)
    state.inspectedIndex = state.activeIndex = state.history.length - 1
  },
  'COMMIT_ALL' (state) {
    state.base = state.history[state.history.length - 1].state
    state.lastCommit = Date.now()
    reset(state)
  },
  'REVERT_ALL' (state) {
    reset(state)
  },
  'COMMIT_SELECTED' (state) {
    state.base = state.history[state.inspectedIndex].state
    state.lastCommit = Date.now()
    state.history = state.history.slice(state.inspectedIndex + 1)
    state.inspectedIndex = -1
  },
  'REVERT_SELECTED' (state) {
    state.history = state.history.slice(0, state.inspectedIndex)
    state.inspectedIndex--
  },
  'RESET' (state) {
    state.base = state.initial
    state.lastCommit = state.initialCommit
    reset(state)
  },
  'STEP' (state, index) {
    state.inspectedIndex = index
  },
  'TIME_TRAVEL' (state, index) {
    state.activeIndex = index
  }
}

function reset (state) {
  state.history = []
  state.inspectedIndex = -1
}

const getters = {
  inspectedState ({ base, history, inspectedIndex }) {
    const entry = history[inspectedIndex]
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
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
