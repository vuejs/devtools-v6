<template>
  <SplitPane class="fps">
    <div
      slot="left"
      style="height: 100%"
    >
      <div
        v-if="metrics.fps"
        ref="chart"
        class="chart"
        @wheel="onMouseWheel"
      >
        <div class="markers">
          <div
            v-for="marker of fpsMarkers"
            :key="marker.time"
            :style="getMarkerStyle(marker)"
            class="marker"
            :class="{
              selected: selectedMarker === marker
            }"
            @click="selectedMarker = marker"
          >
            <div
              v-for="bubble of marker.bubbles"
              :key="bubble.type"
              v-tooltip="{
                content: `${bubble.entries.length} ${bubble.type}`,
                delay: { show: 100, hide: 0 }
              }"
              :style="getBubbleStyle(bubble)"
              class="bubble"
            >
              <div class="label">
                {{ bubble.type.charAt(0) }}
              </div>
            </div>
          </div>
        </div>

        <div class="row bars">
          <div
            v-for="(metric, index) of metrics.fps"
            :key="index"
            v-tooltip="{
              content: getBarTootip(metric),
              delay: { show: 100, hide: 0 }
            }"
            class="bar-wrapper"
            @click="onMetricClick(metric)"
          >
            <div
              :style="getMetricStyle(metric)"
              class="bar"
            />
          </div>
        </div>
      </div>
    </div>

    <FramerateMarkerInspector
      slot="right"
      :marker="selectedMarker"
    />
  </SplitPane>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as d3 from 'd3'
import { FPS_MARKERS_PRECISION } from './module'
import { formatTime } from 'filters'

import SplitPane from 'components/SplitPane.vue'
import FramerateMarkerInspector from './FramerateMarkerInspector.vue'

const BUBBLE_COLORS = {
  mutations: '#FF6B00',
  events: '#997fff',
  routes: '#42B983'
}

// In ms
const SLICE_TIME = 500
// In pixels
const SLICE_WIDTH = 12

export default {
  components: {
    SplitPane,
    FramerateMarkerInspector
  },

  data () {
    return {
      selectedMarker: null
    }
  },

  computed: {
    ...mapState('perf', [
      'currentBenchmark'
    ]),

    ...mapGetters('perf', [
      'metrics',
      'fpsMarkers'
    ]),

    values () {
      return this.metrics.fps.map(metric => metric.value)
    },

    max () {
      return d3.max(this.values)
    },

    scale () {
      return d3.scaleLinear()
        .domain(d3.extent([0].concat(this.values)))
        .range([0, 100])
    },

    interpolateColor () {
      return d3.interpolateRgb(
        '#C41A16',
        '#44A1FF'
      )
    }
  },

  watch: {
    'metrics.fps' () {
      const el = this.$refs.chart
      if (el && el.scrollLeft >= el.scrollWidth - el.offsetWidth - 100) {
        this.scrollToEnd()
      }
    },

    currentBenchmark () {
      this.selectedMarker = null
    }
  },

  mounted () {
    this.scrollToEnd()
  },

  methods: {
    scrollToEnd () {
      requestAnimationFrame(() => {
        const el = this.$refs.chart
        if (el) el.scrollLeft = 9999
      })
    },

    getMetricStyle (metric) {
      const { value, start, end } = metric
      const duration = end - start
      return {
        width: `${duration / SLICE_TIME * SLICE_WIDTH}px`,
        height: `${this.scale(value)}%`,
        backgroundColor: this.interpolateColor(this.scale(value) / 100)
      }
    },

    getBarTootip (metric) {
      return `
      <div>${metric.value} frames per second</div>
      <div style="color:#999;">${formatTime(metric.time)}</div>
      `
    },

    getMarkerStyle (marker) {
      const start = Math.round(this.currentBenchmark.start / FPS_MARKERS_PRECISION) * FPS_MARKERS_PRECISION
      return {
        left: `${(marker.time - start) / SLICE_TIME * SLICE_WIDTH - 12}px`
      }
    },

    getBubbleStyle (bubble) {
      return {
        backgroundColor: BUBBLE_COLORS[bubble.type]
      }
    },

    onMouseWheel (event) {
      const el = this.$refs.chart
      el.scrollLeft += ((event.deltaX || event.deltaY) * 5)
      event.preventDefault()
    },

    onMetricClick (metric) {
      const index = Math.round(metric.time / FPS_MARKERS_PRECISION) * FPS_MARKERS_PRECISION
      this.selectedMarker = this.fpsMarkers[index]
    }
  }
}
</script>

<style lang="stylus" scoped>
.fps
  height 100%

.chart
  display flex
  flex-direction column
  height 100%
  overflow-x auto

.row
  display flex

.markers
  flex 80px 0 0
  position relative

.marker
  position absolute
  top 0
  padding-bottom 8px
  display flex
  flex-direction column
  justify-content flex-end
  align-items center
  cursor pointer
  height 100%
  pointer-events none
  &:hover
    .bubble
      transform scale(1.2)
  &.selected
    .bubble
      background $vue-ui-color-primary !important
      transform scale(1.3)
  .bubble
    position relative
    z-index 1
    pointer-events all
    width 18px
    height @width
    border-radius 50%
    transition transform .2s ease-in-out
    &:not(:last-child)
      margin-bottom 5px
  .label
    font-size 11px
    line-height @font-size
    color $md-white
    text-align center
    position relative
    top 4px
    text-transform uppercase
    font-weight bold

.bars
  flex 100% 1 1

.bar-wrapper
  display flex
  align-items flex-end
  height 100%
  &:hover
    background rgba($vue-ui-color-primary, .1)
    .bar
      background $vue-ui-color-primary !important

.bar
  flex auto 0 0
  min-width 12px
</style>
