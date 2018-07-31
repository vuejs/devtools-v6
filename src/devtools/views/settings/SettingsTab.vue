<template>
  <div class="grid">
    <GlobalPreferences />
  </div>
</template>

<script>
import GlobalPreferences from './GlobalPreferences.vue'
import { mapState } from 'vuex'

export default {
  components: { GlobalPreferences },

  computed: mapState('events', [
    'enabled'
  ])
}
</script>
