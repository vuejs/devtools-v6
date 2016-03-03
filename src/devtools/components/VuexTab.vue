<template>
  <div id="vuex-tab">
    <button @click="commit">commit</button>
    <button @click="revert">revert</button>
    <button @click="reset">reset</button>
    <div v-for="entry in history">
      {{ entry.mutation.type }}
    </div>
  </div>
</template>

<script>
export default {
  vuex: {
    state: {
      history: state => state.vuex.history
    },
    actions: {
      commit: ({ dispatch, state }) => {
        if (state.vuex.history.length > 0) {
          dispatch('vuex/COMMIT')
        }
      },
      revert: ({ dispatch, state }) => {
        if (state.vuex.history.length > 0) {
          dispatch('vuex/REVERT')
          bridge.send('vuex:travel-to-state', state.vuex.base)
        }
      },
      reset: ({ dispatch, state }) => {
        dispatch('vuex/RESET')
        bridge.send('vuex:travel-to-state', state.vuex.initial)
      },
      step: ({ dispatch, state }, n) => {
        const entry = state.vuex.history[n]
        if (entry) {
          dispatch('vuex/SETP', n)
          bridge.send('vuex:travel-to-state', entry.state)
        }
      }
    }
  }
}
</script>
