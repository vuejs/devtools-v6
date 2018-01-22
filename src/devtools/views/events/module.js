import storage from '../../storage'
import { classify } from 'src/util'

const ENABLED_KEY = 'EVENTS_ENABLED'
const enabled = storage.get(ENABLED_KEY)

const state = {
  enabled: enabled == null ? true : enabled,
  events: [],
  inspectedIndex: -1,
  newEventCount: 0,
  filter: ''
}

const mutations = {
  'RECEIVE_EVENT' (state, payload) {
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
    if (index < 0) index = 0
    if (index >= state.events.length) index = state.events.length - 1
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

const getters = {
  activeEvent: state => {
    return state.events[state.inspectedIndex]
  },
  filteredEvents: (state, getters, rootState) => {
    const classifyComponents = rootState.components.classifyComponents
    let searchText = state.filter.toLowerCase()
    const searchComponent = /<|>/g.test(searchText)
    if (searchComponent) {
      searchText = searchText.replace(/<|>/g, '')
    }
    return state.events.filter(
      e => (searchComponent ? (classifyComponents ? classify(e.instanceName) : e.instanceName) : e.eventName).toLowerCase().indexOf(searchText) > -1
    )
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
