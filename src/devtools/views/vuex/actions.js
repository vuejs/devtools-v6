export function commitAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('COMMIT_ALL')
    travelTo(state, commit)
  }
}

export function revertAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('REVERT_ALL')
    travelTo(state, commit)
  }
}

export function commitSelected ({ commit, state }) {
  commit('COMMIT_SELECTED')
  travelTo(state, commit)
}

export function revertSelected ({ commit, state }) {
  commit('REVERT_SELECTED')
  travelTo(state, commit)
}

export function reset ({ commit, state }) {
  commit('RESET')
  travelTo(state, commit)
}

export function step ({ commit, state }, index) {
  if (typeof index !== 'number') {
    index = state.history.indexOf(index)
  }
  commit('STEP', index)
}

export function timeTravelToSelected ({ state, commit }) {
  travelTo(state, commit)
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

function travelTo (state, commit) {
  const { history, inspectedIndex, base } = state
  const targetState = inspectedIndex > -1
    ? history[inspectedIndex].state
    : base
  bridge.send('vuex:travel-to-state', targetState)
  commit('TIME_TRAVEL', inspectedIndex)
}
