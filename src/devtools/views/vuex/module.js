import { parse } from 'src/util'
import * as actions from './actions'
import storage from '../../storage'

const REGEX_RE = /^\/(.*?)\/(\w*)/
const ANY_RE = new RegExp('.*', 'i')
const ENABLED_KEY = 'VUEX_ENABLED'
const enabled = storage.get(ENABLED_KEY)

const state = {
  enabled: enabled == null ? true : enabled,
  hasVuex: false,
  initial: null,
  base: null, // type Snapshot = { state: {}, getters: {} }
  inspectedIndex: -1,
  activeIndex: -1,
  history: [/* { mutation, timestamp, snapshot } */],
  initialCommit: Date.now(),
  lastCommit: Date.now(),
  filter: '',
  filterRegex: ANY_RE,
  filterRegexInvalid: false
}

const mutations = {
  'INIT' (state, snapshot) {
    state.initial = state.base = snapshot
    state.hasVuex = true
    reset(state)
  },
  'RECEIVE_MUTATION' (state, entry) {
    state.history.push(entry)
    if (!state.filter) {
      state.inspectedIndex = state.activeIndex = state.history.length - 1
    }
  },
  'COMMIT_ALL' (state) {
    state.base = state.history[state.history.length - 1].snapshot
    state.lastCommit = Date.now()
    reset(state)
  },
  'REVERT_ALL' (state) {
    reset(state)
  },
  'COMMIT' (state, index) {
    state.base = state.history[index].snapshot
    state.lastCommit = Date.now()
    state.history = state.history.slice(index + 1)
    state.inspectedIndex = -1
  },
  'REVERT' (state, index) {
    state.history = state.history.slice(0, index)
    state.inspectedIndex = state.history.length - 1
  },
  'INSPECT' (state, index) {
    state.inspectedIndex = index
  },
  'TIME_TRAVEL' (state, index) {
    state.activeIndex = index
  },
  'TOGGLE' (state) {
    storage.set(ENABLED_KEY, state.enabled = !state.enabled)
  },
  'UPDATE_FILTER' (state, filter) {
    state.filter = filter
    const regexParts = filter.match(REGEX_RE)
    if (regexParts !== null) {
      // looks like it might be a regex -> try to compile it
      try {
        state.filterRegexInvalid = false
        state.filterRegex = new RegExp(regexParts[1], regexParts[2])
      } catch (e) {
        state.filterRegexInvalid = true
        state.filterRegex = ANY_RE
      }
    } else {
      // simple case-insensitve search
      state.filterRegexInvalid = false
      state.filterRegex = new RegExp(escapeStringForRegExp(filter), 'i')
    }
  }
}

function reset (state) {
  state.history = []
  state.inspectedIndex = state.activeIndex = -1
}

function escapeStringForRegExp (str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
}

const getters = {
  inspectedState ({ base, history, inspectedIndex }) {
    const entry = history[inspectedIndex]
    const res = {}

    if (entry) {
      res.mutation = {
        type: entry.mutation.type,
        payload: entry.mutation.payload ? parse(entry.mutation.payload) : undefined
      }
    }

    const snapshot = parse(entry ? entry.snapshot : base)
    res.state = snapshot.state
    res.getters = snapshot.getters

    return res
  },

  filteredHistory ({ history, filterRegex }) {
    return history.filter(entry => filterRegex.test(entry.mutation.type))
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
