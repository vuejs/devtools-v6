<template>
  <scroll-pane>
    <div
      v-if="activeRouteChange"
      slot="scroll"
    >
      <state-inspector :state="{ from, to }" />
    </div>
    <div
      v-else
      slot="scroll"
      class="no-route-data"
    >
      No route transition selected
    </div>
  </scroll-pane>
</template>

<script>
import StateInspector from 'components/StateInspector.vue'
import ScrollPane from 'components/ScrollPane.vue'
import { mapGetters } from 'vuex'
import { UNDEFINED } from 'src/util'

export default {
  components: {
    ScrollPane,
    StateInspector
  },
  computed: {
    ...mapGetters('router', [
      'activeRouteChange'
    ]),
    to () {
      return this.sanitizeRouteData(this.activeRouteChange.to)
    },
    from () {
      return this.sanitizeRouteData(this.activeRouteChange.from)
    }
  },
  methods: {
    sanitizeRouteData (routeData) {
      const data = {
        path: routeData.path,
        fullPath: routeData.fullPath
      }
      if (routeData.redirectedFrom) {
        data.redirectedFrom = routeData.redirectedFrom
      }
      if (!this.isEmptyObject(routeData.params)) {
        data.params = routeData.params
      }
      if (!this.isEmptyObject(routeData.query)) {
        data.query = routeData.query
      }
      if (routeData.name && routeData.name !== UNDEFINED) {
        data.name = routeData.name
      }
      if (routeData.hash && routeData.hash !== '') {
        data.hash = routeData.hash
      }
      if (routeData.meta && !this.isEmptyObject(routeData.meta)) {
        data.meta = routeData.meta
      }
      if (routeData.matched && routeData.matched.length > 0) {
        data.matched = this.sanitizeMatched(routeData.matched)
      }
      return data
    },
    isEmptyObject (obj) {
      return Object.keys(obj).length === 0
    },
    sanitizeMatched (matched) {
      const result = []
      for (let i = 0; i < matched.length; i++) {
        const obj = {
          path: matched[i].path
        }
        if (matched[i].props && !this.isEmptyObject(matched[i].props)) {
          obj.props = matched[i].props
        }
        result.push(obj)
      }
      return result
    }
  }
}
</script>

<style lang="stylus" scoped>
.no-route-data
  color: #ccc
  text-align: center
  margin-top: 50px
  line-height: 30px
</style>
