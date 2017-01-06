export function commitAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('COMMIT_ALL')
    travelTo(state, commit, null)
  }
}

export function revertAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('REVERT_ALL')
    travelTo(state, commit, null)
  }
}

export function commit ({ commit, state }, entry) {
  commit('COMMIT_SELECTED')
  travelTo(state, commit, entry)
}

export function revert ({ commit, state }, entry) {
  commit('REVERT_SELECTED')
  travelTo(state, commit, entry)
}

export function inspect ({ commit, state }, entryOrIndex) {
  if (typeof entryOrIndex !== 'number') {
    entryOrIndex = state.history.indexOf(entryOrIndex)
  }
  commit('INSPECT', entryOrIndex)
}

export function timeTravelTo ({ state, commit }, entry) {
  travelTo(state, commit, entry)
}

export function toggleRecording ({ state, commit }) {
  commit('TOGGLE')
  bridge.send('vuex:toggle-recording', state.enabled)
}

export function importState ({ commit, dispatch }, importedState) {
  commit('INIT', importedState)
  dispatch('reset')
}

export function updateFilter ({ commit }, filter) {
  commit('UPDATE_FILTER', filter)
}

function travelTo (state, commit, entry) {
  const { history, base } = state
  const targetState = entry ? entry.state : base
  bridge.send('vuex:travel-to-state', targetState)
  commit('TIME_TRAVEL', history.indexOf(entry))
}
