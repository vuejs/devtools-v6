const state = {
  events: [],
  filteredEvents: [],
  activeFilteredEventIndex: 0,
  newEventCount: 0
}

const mutations = {
  'EMIT' (state, payload) {
    if (state.events.length === state.filteredEvents.length) {
      state.filteredEvents.push(payload)
    }
    state.events.push(payload)
    state.activeFilteredEventIndex = state.filteredEvents.length - 1
  },
  'RESET' (state) {
    state.events = []
    state.filteredEvents = []
  },
  'STEP' (state, n) {
    state.activeFilteredEventIndex = n
  },
  'RESET_NEW_EVENT_COUNT' (state) {
    state.newEventCount = 0
  },
  'INCREASE_NEW_EVENT_COUNT' (state) {
    state.newEventCount++
  },
  'FILTER_EVENTS' (state, filter) {
    state.filteredEvents = state.events.filter(event => {
      return event.eventName.toLowerCase().includes(filter) || event.instanceName.toLowerCase().includes(filter)
    })
    state.activeFilteredEventIndex = state.filteredEvents.length - 1
  }
}

const getters = {
  activeEvent: state => state.filteredEvents[state.activeFilteredEventIndex],
  hasEvents: state => state.events.length > 0
}

export default {
  namespaced: true,
  state,
  mutations,
  getters
}
