import storage from 'src/storage'
import { classify } from 'src/util'
import SharedData from 'src/shared-data'

const ENABLED_KEY = 'EVENTS_ENABLED'
const enabled = storage.get(ENABLED_KEY)
const REGEX_RE = /^\/((?:(?:.*?)(?:\\\/)?)*?)\/(\w*)/

let uid = 0

const state = {
  enabled: enabled == null ? true : enabled,
  events: [],
  inspectedIndex: -1,
  newEventCount: 0,
  filter: ''
}

const mutations = {
  'RECEIVE_EVENT' (state, payload) {
    payload.id = uid++
    state.events.push(payload)
    if (!state.filter) {
      state.inspectedIndex = state.events.length - 1
    }
  },
  'RESET' (state) {
    state.events = []
    state.inspectedIndex = -1
  },
  'INSPECT' (state, index) {
    state.inspectedIndex = index
  },
  'RESET_NEW_EVENT_COUNT' (state) {
    state.newEventCount = 0
  },
  'INCREASE_NEW_EVENT_COUNT' (state) {
    state.newEventCount++
  },
  'UPDATE_FILTER' (state, filter) {
    state.filter = filter
  },
  'TOGGLE' (state) {
    storage.set(ENABLED_KEY, state.enabled = !state.enabled)
    bridge.send('events:toggle-recording', state.enabled)
  }
}

const matchingEvent = ({ searchText, searchComponent, regEx }) => e => {
  const classifyComponents = SharedData.classifyComponents
  let searchTerm = (searchComponent
    ? (classifyComponents
      ? classify(e.instanceName) : e.instanceName)
    : e.eventName)

  if (regEx) {
    try {
      return regEx.test(searchTerm)
    } catch (e) {
      return searchTerm.toLowerCase().indexOf(searchText) > -1
    }
  }

  return searchTerm.toLowerCase().indexOf(searchText) > -1
}

const getters = {
  activeEvent: (state, getters) => {
    return getters.filteredEvents[state.inspectedIndex]
  },
  filteredEvents: (state, getters, rootState) => {
    let searchText = state.filter.toLowerCase()
    const searchComponent = /<|>/g.test(searchText)
    if (searchComponent) {
      searchText = searchText.replace(/<|>/g, '')
    }
    const regExParts = state.filter.match(REGEX_RE)
    let regEx
    if (regExParts) {
      regEx = new RegExp(regExParts[1], regExParts[2])
    }
    return state.events
      .filter(matchingEvent({ searchText, searchComponent, regEx }))
  }
}

const actions = {
  inspect: ({ commit, getters }, index) => {
    if (index < 0) index = 0
    if (index >= getters.filteredEvents.length) index = getters.filteredEvents.length - 1
    commit('INSPECT', index)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters,
  actions
}
