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
          icon-left="play_arrow"
          class="icon-button flat"
          @click="start()"
        />
        <VueButton
          v-else
          v-tooltip="'Stop benchmark'"
          icon-left="stop"
          class="icon-button flat"
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
            No saved benchmark
          </div>
        </VueSelect>

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
      this.$_timer = setTimeout(() => this.stop(), MAX_DURATION)
    },

    stop () {
      this.updateBenchmark({
        end: Date.now()
      })
      clearTimeout(this.$_timer)
      this.$shared.recordPerf = false
    }
  }
}
</script>

<style lang="stylus" scoped>
.saved-benchmarks-select
  width 250px
</style>
