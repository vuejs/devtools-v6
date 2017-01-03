export function commitAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('COMMIT_ALL')
    travelTo(state)
  }
}

export function revertAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('REVERT_ALL')
    travelTo(state)
  }
}

export function commitSelected ({ commit, state }) {
  commit('COMMIT_SELECTED')
  travelTo(state)
}

export function revertSelected ({ commit, state }) {
  commit('REVERT_SELECTED')
  travelTo(state)
}

export function reset ({ commit, state }) {
  commit('RESET')
  travelTo(state)
}

export function step ({ commit, state }, index) {
  commit('STEP', index)
  travelTo(state)
}

export function importState (store, importedState) {
  store.commit('INIT', importedState)
  store.dispatch('reset')
}

function travelTo (state) {
  const { history, activeIndex, base } = state
  const targetState = activeIndex > -1
    ? history[activeIndex].state
    : base
  bridge.send('vuex:travel-to-state', targetState)
}
