<template>
  <div class="perf-tab">
    <ScrollPane>
      <ActionHeader
        slot="header"
        class="no-search"
      >
        <VueButton
          v-if="!$shared.recordPerf"
          v-tooltip="'Start benchmark'"
          icon-left="lens"
          class="icon-button flat"
          @click="start()"
        />
        <VueButton
          v-else
          v-tooltip="'Stop benchmark'"
          icon-left="lens"
          class="icon-button flat stop-button"
          @click="stop()"
        />

        <VueSelect
          v-model="currentBenchmarkModel"
          :disabled="$shared.recordPerf"
          placeholder="Select saved benchmark..."
          button-class="flat"
          class="saved-benchmarks-select"
        >
          <VueSelectButton
            v-for="(benchmark, index) of benchmarks"
            :key="index"
            :value="benchmark"
            :label="benchmark.label"
          />

          <div
            v-if="!benchmarks.length"
            class="vue-ui-empty"
          >
            No saved benchmark yet
          </div>
        </VueSelect>

        <div
          v-if="currentBenchmark && $responsive.width > 900"
          class="benchmark-duration"
        >
          Total duration: {{ Math.round(benchmarkDuration / 1000) }}s
        </div>

        <div class="vue-ui-spacer" />

        <VueGroup
          v-model="routeModel"
        >
          <VueGroupButton
            value="fps"
          >
            Frames per second
          </VueGroupButton>

          <VueGroupButton
            value="component-render"
          >
            Component render
          </VueGroupButton>
        </VueGroup>
      </ActionHeader>

      <router-view slot="scroll" />
    </ScrollPane>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'

import ScrollPane from 'components/ScrollPane.vue'
import ActionHeader from 'components/ActionHeader.vue'

const DEFAULT_ROUTE = 'fps'
const MAX_DURATION = 300000

export default {
  components: {
    ScrollPane,
    ActionHeader
  },

  data () {
    return {
      now: Date.now()
    }
  },

  computed: {
    ...mapState('perf', [
      'currentBenchmark',
      'benchmarks'
    ]),

    currentBenchmarkModel: {
      get () { return this.currentBenchmark },
      set (value) { this.setCurrentBenchmark(value) }
    },

    routeModel: {
      get () { return this.$route.name },
      set (value) {
        this.$router.push({ name: value })
      }
    },

    benchmarkDuration () {
      if (this.currentBenchmark) {
        let end
        if (this.currentBenchmark.end) {
          end = this.currentBenchmark.end
        } else {
          end = this.now
        }
        return end - this.currentBenchmark.start
      }
      return 0
    }
  },

  created () {
    if (this.$route.matched.length <= 1) {
      this.$router.replace({ name: DEFAULT_ROUTE })
    }
  },

  methods: {
    ...mapMutations('perf', {
      setCurrentBenchmark: 'SET_CURRENT_BENCHMARK',
      updateBenchmark: 'UPDATE_BENCHMARK',
      addBenchmark: 'ADD_BENCHMARK'
    }),

    start () {
      const benchmark = {
        start: Date.now(),
        end: null,
        label: new Date().toLocaleString(),
        metrics: {
          fps: [],
          componentRender: []
        }
      }
      this.addBenchmark(benchmark)
      this.currentBenchmarkModel = benchmark
      this.$shared.recordPerf = true
      this.now = Date.now()
      this.$_timer = setTimeout(() => this.stop(), MAX_DURATION)
      this.$_secondTimer = setInterval(() => {
        this.now = Date.now()
      }, 1000)
    },

    stop () {
      this.updateBenchmark({
        end: Date.now()
      })
      clearTimeout(this.$_timer)
      clearInterval(this.$_secondTimer)
      this.$shared.recordPerf = false
    }
  }
}
</script>

<style lang="stylus" scoped>
.saved-benchmarks-select
  width 250px

.stop-button
  >>> .vue-ui-icon
    border-radius 50%
    filter drop-shadow(0 0 3px rgba(255, 0, 0, .4))
    animation pulse 3s linear infinite
    svg
      fill red !important

@keyframes pulse
  0%
    opacity 1
  50%
    opacity .5
  100%
    opacity 1

.benchmark-duration
  margin-left 32px
</style>
