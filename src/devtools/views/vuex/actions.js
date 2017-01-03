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
  commit('STEP', index)
}

export function timeTravelToSelected ({ state, commit }) {
  travelTo(state, commit)
}

export function importState (store, importedState) {
  store.commit('INIT', importedState)
  store.dispatch('reset')
}

function travelTo (state, commit) {
  const { history, inspectedIndex, base } = state
  const targetState = inspectedIndex > -1
    ? history[inspectedIndex].state
    : base
  bridge.send('vuex:travel-to-state', targetState)
  commit('TIME_TRAVEL', inspectedIndex)
}
