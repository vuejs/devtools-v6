import { parse } from 'src/util'
import * as actions from './actions'
import { snapshotsCache } from './cache'
import SharedData from 'src/shared-data'

const REGEX_RE = /^\/((?:(?:.*?)(?:\\\/)?)*?)\/(\w*)/
const ANY_RE = new RegExp('.*', 'i')

let uid = 0

const state = {
  hasVuex: false,
  base: null, // type Snapshot = { state: {}, getters: {} }
  inspectedIndex: -1,
  activeIndex: -1,
  history: [/* { mutation, timestamp, snapshot } */],
  initialCommit: Date.now(),
  lastCommit: Date.now(),
  filter: '',
  filterRegex: ANY_RE,
  filterRegexInvalid: false,
  inspectedState: null,
  lastReceivedState: null
}

const mutations = {
  'INIT' (state) {
    state.hasVuex = true
    reset(state)
  },

  'RECEIVE_MUTATION' (state, entry) {
    entry.id = uid++
    state.history.push(entry)
    if (!state.filter) {
      state.inspectedIndex = state.activeIndex = state.history.length - 1
      state.inspectedState = null
    }
  },

  'COMMIT_ALL' (state) {
    state.base = state.lastReceivedState
    state.lastCommit = Date.now()
    reset(state)
  },

  'REVERT_ALL' (state) {
    reset(state)
  },

  'COMMIT' (state, index) {
    state.base = state.lastReceivedState
    state.lastCommit = Date.now()
    state.history = state.history.slice(index + 1)
    state.history.forEach(({ mutation }, index) => {
      mutation.index = index
    })
    state.inspectedIndex = -1
  },

  'REVERT' (state, index) {
    state.history = state.history.slice(0, index)
    state.inspectedIndex = state.history.length - 1
  },

  'INSPECT' (state, index) {
    state.inspectedIndex = index
  },

  'UPDATE_INSPECTED_STATE' (state, value) {
    state.inspectedState = value
  },

  'RECEIVE_STATE' (state, { index, snapshot }) {
    state.lastReceivedState = snapshot
    snapshotsCache.set(index, snapshot)
  },

  'UPDATE_BASE_STATE' (state, value) {
    state.base = value
  },

  'TIME_TRAVEL' (state, index) {
    state.activeIndex = index
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
  state.inspectedState = null
  state.activeIndex = -1
  SharedData.snapshotLoading = false
}

function escapeStringForRegExp (str) {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
}

const getters = {
  inspectedState ({ base, inspectedIndex, inspectedState }, getters) {
    const entry = getters.filteredHistory[inspectedIndex]
    const res = {}

    if (entry) {
      res.mutation = {
        type: entry.mutation.type,
        payload: entry.mutation.payload ? parse(entry.mutation.payload) : undefined
      }
    }

    const data = entry ? inspectedState : base
    if (data) {
      const snapshot = parse(data)
      if (snapshot) {
        res.state = snapshot.state
        res.getters = snapshot.getters
      }
    }

    return res
  },

  filteredHistory ({ history, filterRegex }) {
    return history.filter(entry => filterRegex.test(entry.mutation.type))
  },

  absoluteInspectedIndex ({ history, inspectedIndex }, { filteredHistory }) {
    const entry = filteredHistory[inspectedIndex]
    if (entry) {
      return history.indexOf(entry)
    }
    return -1
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions,
  getters
}
