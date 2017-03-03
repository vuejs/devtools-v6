<template>
  <scroll-pane scroll-event="route:init">
    <action-header slot="header">
      <h2>Route List</h2>
    </action-header>
    <div slot="scroll">
      <div class="entry" v-for="route in routes">{{ route.path }}</div>
    </div>
  </scroll-pane>
</template>

<script>
import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    ScrollPane,
    ActionHeader
  },
  computed: {
    ...mapGetters('router', [
      'routes'
    ])
  }
}
</script>

<style lang="stylus" scoped>
@import "../../common"
.route-heading
  padding: 0px 10px
</style>
