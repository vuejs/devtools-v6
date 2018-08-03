<template>
  <div class="fps">
    <div
      v-if="metrics.fps"
      ref="chart"
      class="chart"
      :class="{
        recording: $shared.recordPerf
      }"
      @wheel="onMouseWheel"
    >
      <div class="markers">
        <div
          v-for="marker of fpsMarkers"
          :key="marker.time"
          :style="getMarkerStyle(marker)"
          class="marker"
        >
          <div
            v-for="bubble of marker.bubbles"
            :key="bubble.type"
            v-tooltip="`${bubble.entries.length} ${bubble.type}`"
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
        >
          <div
            :style="getMetricStyle(metric)"
            class="bar"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import * as d3 from 'd3'

const BUBBLE_COLORS = {
  mutations: '#FF6B00',
  events: '#997fff'
}

const WIDTH_HALF_SECOND = 12

export default {
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
      requestAnimationFrame(() => {
        const el = this.$refs.chart
        el.scrollLeft = 9999
      })
    }
  },

  methods: {
    getMetricStyle (metric) {
      const { value, start, end } = metric
      const duration = end - start
      return {
        width: `${duration / 500 * WIDTH_HALF_SECOND}px`,
        height: `${this.scale(value)}%`,
        backgroundColor: this.interpolateColor(this.scale(value) / 100)
      }
    },

    getBarTootip (metric) {
      return `
      <div>${metric.value} frames per second</div>
      <div style="color:grey;">${new Date(metric.time).toLocaleString()}</div>
      `
    },

    getMarkerStyle (marker) {
      return {
        left: `${(marker.time - this.currentBenchmark.start) / 500 * WIDTH_HALF_SECOND}px`
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
  &.recording
    .bar
      animation bar .3s ease-out

.row
  display flex

.markers
  flex 60px 0 0
  position relative

.marker
  position absolute
  top 0
  padding-top 10px
  display flex
  flex-direction column
  align-items center
  .bubble
    width 11px
    height @width
    border-radius 50%
    cursor pointer
    &:not(:last-child)
      margin-bottom 5px
  .label
    font-size 9px
    line-height @font-size
    color $md-white
    text-align center
    position relative
    top 2px
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
  transform-origin bottom center

@keyframes bar
  0%
    transform scaleY(0)
    opacity 0
  100%
    transform none
    opacity 1
</style>
