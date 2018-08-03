export default {
  namespaced: true,

  state: {
    currentBenchmark: null,
    benchmarks: []
  },

  getters: {
    metrics: state => (state.currentBenchmark && state.currentBenchmark.metrics) || {},

    fpsMarkers (state, getters, rootState) {
      const { currentBenchmark } = state
      let markers = {}
      if (!currentBenchmark) return markers

      const addEntries = (type, list) => {
        for (const entry of list) {
          if (
            entry.timestamp < currentBenchmark.start ||
            (currentBenchmark.end != null && entry.timestamp > currentBenchmark.end)
          ) {
            continue
          }
          const time = Math.round(entry.timestamp / 500) * 500
          let marker = markers[time] = markers[time] || {
            time,
            bubbles: {}
          }
          let bubble = marker.bubbles[type] = marker.bubbles[type] || {
            type,
            entries: []
          }
          bubble.entries.push(entry)
        }
      }

      const { history } = rootState.vuex
      addEntries('mutations', history)

      const { events } = rootState.events
      addEntries('events', events)

      return markers
    }
  },

  mutations: {
    'SET_CURRENT_BENCHMARK' (state, value) {
      state.currentBenchmark = value
    },

    'UPDATE_BENCHMARK' (state, data) {
      Object.assign(state.currentBenchmark, data)
    },

    'ADD_BENCHMARK' (state, benchmark) {
      state.benchmarks.splice(0, 0, benchmark)
    },

    'ADD_METRIC' (state, metric) {
      state.currentBenchmark.metrics[metric.type].push(metric)
    }
  }
}
