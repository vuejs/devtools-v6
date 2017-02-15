import {parse, stringify} from '../../../util'

export function commitAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('COMMIT_ALL')
    travelTo(state, commit, -1)
  }
}

export function revertAll ({ commit, state }) {
  if (state.history.length > 0) {
    commit('REVERT_ALL')
    travelTo(state, commit, -1)
  }
}

export function commit ({ commit, state }, entry) {
  const index = state.history.indexOf(entry)
  if (index > -1) {
    commit('COMMIT', index)
    travelTo(state, commit, -1)
  }
}

export function revert ({ commit, state }, entry) {
  const index = state.history.indexOf(entry)
  if (index > -1) {
    commit('REVERT', index)
    travelTo(state, commit, state.history.length - 1)
  }
}

export function inspect ({ commit, state }, entryOrIndex) {
  let index = typeof entryOrIndex === 'number'
    ? entryOrIndex
    : state.history.indexOf(entryOrIndex)
  if (index < -1) index = -1
  if (index >= state.history.length) index = state.history.length - 1
  commit('INSPECT', index)
}

export function timeTravelTo ({ state, commit }, entry) {
  travelTo(state, commit, state.history.indexOf(entry))
}

export function toggleRecording ({ state, commit }) {
  commit('TOGGLE')
  bridge.send('vuex:toggle-recording', state.enabled)
}

export function importState ({ commit }, importedState) {
  commit('INIT', importedState)
}

export function updateFilter ({ commit }, filter) {
  commit('UPDATE_FILTER', filter)
}

function travelTo (state, commit, index) {
  const { history, base } = state
  const targetState = index > -1 ? history[index].state : base

  // Need to send only the state (not getters) into the bridge
  let parsedState = parse(targetState)
  bridge.send('vuex:travel-to-state', stringify(parsedState.state))
  commit('TIME_TRAVEL', index)
}
