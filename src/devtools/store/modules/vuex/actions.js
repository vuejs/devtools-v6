export function commitAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('vuex/COMMIT_ALL')
    travelTo(state)
  }
}

export function revertAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('vuex/REVERT_ALL')
    travelTo(state)
  }
}

export function commitSelected ({ commit, state }) {
  commit('vuex/COMMIT_SELECTED')
  travelTo(state)
}

export function revertSelected ({ commit, state }) {
  commit('vuex/REVERT_SELECTED')
  travelTo(state)
}

export function reset ({ commit, state }) {
  commit('vuex/RESET')
  travelTo(state)
}

export function step ({ commit, state }, index) {
  commit('vuex/STEP', index)
  travelTo(state)
}

export function importState (store, importedState) {
  store.commit('vuex/INIT', importedState)
  store.dispatch('reset')
}

function travelTo (state) {
  const { history, activeIndex, base } = state
  const targetState = activeIndex > -1
    ? history[activeIndex].state
    : base
  bridge.send('vuex:travel-to-state', targetState)
}
