const state = {
  events: [],
  filteredEvents: [],
  activeFilteredEventIndex: 0,
  newEventCount: 0
}

const mutations = {
  'events/EMIT' (state, payload) {
    if (state.events.length === state.filteredEvents.length) {
      state.filteredEvents.push(payload)
    }
    state.events.push(payload)
    state.activeFilteredEventIndex = state.filteredEvents.length - 1
  },
  'events/RESET' (state) {
    state.events = []
    state.filteredEvents = []
  },
  'events/STEP' (state, n) {
    state.activeFilteredEventIndex = n
  },
  'events/RESET_NEW_EVENT_COUNT' (state) {
    state.newEventCount = 0
  },
  'events/INCREASE_NEW_EVENT_COUNT' (state) {
    state.newEventCount++
  },
  'events/FILTER_EVENTS' (state, filter) {
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
  state,
  mutations,
  getters
}
