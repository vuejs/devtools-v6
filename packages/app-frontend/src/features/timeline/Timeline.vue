<script lang="ts">
import SplitPane from '@front/features/layout/SplitPane.vue'
import PluginSourceIcon from '@front/features/plugin/PluginSourceIcon.vue'
import TimelineView from './TimelineView.vue'
import TimelineScrollbar from './TimelineScrollbar.vue'
import LayerItem from './LayerItem.vue'
import TimelineEventList from './TimelineEventList.vue'
import TimelineEventInspector from './TimelineEventInspector.vue'
import AskScreenshotPermission from './AskScreenshotPermission.vue'

import { computed, onMounted, ref, watch, defineComponent, onUnmounted } from '@vue/composition-api'
import { onSharedDataChange } from '@front/util/shared-data'
import { formatTime } from '@front/util/format'
import SharedData from '@utils/shared-data'
import {
  useTime,
  useLayers,
  resetTimeline,
  useCursor,
  useSelectedEvent,
  useScreenshots,
  supportsScreenshot
} from './composable'

export default defineComponent({
  components: {
    SplitPane,
    LayerItem,
    TimelineView,
    TimelineScrollbar,
    TimelineEventList,
    TimelineEventInspector,
    AskScreenshotPermission,
    PluginSourceIcon
  },

  setup () {
    const {
      layers,
      vScroll,
      allLayers,
      isLayerHidden,
      setLayerHidden,
      hoverLayerId,
      selectedLayer,
      selectLayer
    } = useLayers()
    const layersEl = ref()

    function applyScroll () {
      if (layersEl.value && layersEl.value.scrollTop !== vScroll.value) {
        layersEl.value.scrollTop = vScroll.value
      }
    }

    watch(vScroll, () => {
      applyScroll()
    }, {
      immediate: true
    })

    onMounted(() => {
      applyScroll()
    })

    function onLayersScroll (event: WheelEvent) {
      const target = event.currentTarget as HTMLElement
      if (target.scrollTop !== vScroll.value) {
        vScroll.value = target.scrollTop
      }
    }

    // Time

    const {
      startTime,
      endTime,
      minTime,
      maxTime
    } = useTime()

    const {
      selectedEvent
    } = useSelectedEvent()

    // Scroll to selected event
    watch(selectedEvent, event => {
      if (!event) return

      const size = endTime.value - startTime.value
      if (event.time < startTime.value || event.time > endTime.value) {
        startTime.value = event.time - size / 2
        if (startTime.value < minTime.value) {
          startTime.value = minTime.value
        }
        endTime.value = startTime.value + size
        if (endTime.value > maxTime.value) {
          endTime.value = maxTime.value
          startTime.value = endTime.value - size
        }
      }
    })

    // Time cursor

    const { cursorTime } = useCursor()

    const formattedCursorTime = computed(() => cursorTime.value ? formatTime(cursorTime.value, 'ms') : null)

    // Screenshots

    const askScreenshotPermission = ref(false)

    if (!supportsScreenshot) {
      SharedData.timelineScreenshots = false
    }

    onSharedDataChange('timelineScreenshots', (value) => {
      if (value) {
        chrome.permissions.contains({
          permissions: ['activeTab'],
          origins: [
            'http://*/*',
            'https://*/*',
            'file:///*'
          ]
        }, granted => {
          if (!granted) {
            /* Ask modal disabled for now */
            // askScreenshotPermission.value = true
            // SharedData.timelineScreenshots = false
          }
        })
      }
    })

    const {
      screenshots,
      showScreenshot
    } = useScreenshots()

    watch(cursorTime, value => {
      if (!SharedData.timelineScreenshots) return

      let choice = null
      if (value != null) {
        choice = screenshots.value[0]
        for (const screenshot of screenshots.value) {
          if (screenshot.time > value + 50) {
            break
          } else {
            choice = screenshot
          }
        }
      }
      showScreenshot(choice)
    })

    // Zoom

    let zoomTimer
    let zoomDelayTimer

    function zoom (delta: number) {
      const wrapper: HTMLDivElement = document.querySelector('[data-id="timeline-view-wrapper"]')
      const viewWidth = wrapper.offsetWidth
      const size = endTime.value - startTime.value

      const center = size * 0.5 + startTime.value

      let newSize = size + delta / viewWidth * size * 2
      if (newSize < 10) {
        newSize = 10
      }

      let start = center - newSize * 0.5
      let end = center + newSize * (1 - 0.5)
      if (start < minTime.value) {
        start = minTime.value
      }
      if (end > maxTime.value) {
        end = maxTime.value
      }
      startTime.value = start
      endTime.value = end
    }

    function zoomIn () {
      zoom(-50)
      zoomDelayTimer = setTimeout(() => {
        zoomTimer = setInterval(() => {
          zoom(-50)
        }, 75)
      }, 200)
      window.addEventListener('mouseup', () => stopZoom())
    }

    function zoomOut () {
      zoom(50)
      zoomDelayTimer = setTimeout(() => {
        zoomTimer = setInterval(() => {
          zoom(50)
        }, 75)
      }, 200)
      window.addEventListener('mouseup', () => stopZoom())
    }

    function stopZoom () {
      clearInterval(zoomTimer)
      clearTimeout(zoomDelayTimer)
    }

    onUnmounted(() => {
      stopZoom()
    })

    // Move buttons

    let moveTimer
    let moveDelayTimer

    function move (delta: number) {
      const wrapper: HTMLDivElement = document.querySelector('[data-id="timeline-view-wrapper"]')
      const viewWidth = wrapper.offsetWidth
      const size = endTime.value - startTime.value
      let start = startTime.value + delta / viewWidth * size
      let end = start + size
      if (start < minTime.value) {
        start = minTime.value
        end = start + size
      }
      if (end > maxTime.value) {
        end = maxTime.value
        start = end - size
      }
      startTime.value = start
      endTime.value = end
    }

    function moveLeft () {
      move(-25)
      moveDelayTimer = setTimeout(() => {
        moveTimer = setInterval(() => {
          move(-25)
        }, 75)
      }, 200)
      window.addEventListener('mouseup', () => stopMove())
    }

    function moveRight () {
      move(25)
      moveDelayTimer = setTimeout(() => {
        moveTimer = setInterval(() => {
          move(25)
        }, 75)
      }, 200)
      window.addEventListener('mouseup', () => stopMove())
    }

    function stopMove () {
      clearInterval(moveTimer)
      clearTimeout(moveDelayTimer)
    }

    onUnmounted(() => {
      stopMove()
    })

    return {
      startTime,
      endTime,
      minTime,
      maxTime,
      layers,
      vScroll,
      layersEl,
      onLayersScroll,
      hoverLayerId,
      selectedLayer,
      selectLayer,
      allLayers,
      isLayerHidden,
      setLayerHidden,
      resetTimeline,
      formattedCursorTime,
      askScreenshotPermission,
      supportsScreenshot,
      zoomIn,
      zoomOut,
      moveLeft,
      moveRight
    }
  }
})
</script>

<template>
  <div>
    <SplitPane
      save-id="timeline-main"
      :default-split="25"
      :min="10"
      dragger-offset="before"
    >
      <template #left>
        <div class="flex flex-col h-full">
          <div class="h-4 flex-none border-b border-gray-200 dark:border-gray-800 box-content" />

          <div
            ref="layersEl"
            class="flex flex-col flex-1 overflow-y-auto"
            data-scroller="layers"
            @scroll="onLayersScroll"
          >
            <LayerItem
              v-for="layer of layers"
              :key="layer.id"
              :layer="layer"
              :hover="hoverLayerId === layer.id"
              :selected="selectedLayer === layer"
              class="flex-none"
              @mouseenter.native="hoverLayerId = layer.id"
              @mouseleave.native="hoverLayerId = null"
              @select="selectLayer(layer)"
            />
          </div>
        </div>
      </template>

      <template #right>
        <SplitPane
          save-id="timeline-right"
          :default-split="50"
          :max="85"
          dragger-offset="after"
        >
          <template #left>
            <div class="h-full flex flex-col">
              <div class="flex items-center flex-none border-b border-gray-200 dark:border-gray-800">
                <VueButton
                  icon-left="arrow_left"
                  class="flex-none w-4 h-4 p-0 flat zoom-btn"
                  @mousedown.native="moveLeft()"
                />

                <TimelineScrollbar
                  :min.sync="minTime"
                  :max.sync="maxTime"
                  :start.sync="startTime"
                  :end.sync="endTime"
                  class="flex-1"
                />

                <VueButton
                  icon-left="arrow_right"
                  class="flex-none w-4 h-4 p-0 flat zoom-btn"
                  @mousedown.native="moveRight()"
                />

                <VueButton
                  v-tooltip="'Zoom in'"
                  icon-left="add"
                  class="flex-none w-4 h-4 p-0 flat zoom-btn"
                  @mousedown.native="zoomIn()"
                />

                <VueButton
                  v-tooltip="'Zoom out'"
                  icon-left="remove"
                  class="flex-none w-4 h-4 p-0 flat zoom-btn"
                  @mousedown.native="zoomOut()"
                />
              </div>
              <TimelineView
                class="h-full"
              />

              <div class="absolute top-0 left-0 w-full pointer-events-none flex items-center justify-center">
                <div
                  v-if="formattedCursorTime"
                  class="text-gray-700 dark:text-gray-300 bg-white dark:bg-black border border-gray-200 dark:border-gray-800 px-1 py-0.5 rounded-full text-2xs font-mono leading-none mt-1 flex items-center space-x-0.5"
                >
                  <VueIcon
                    icon="schedule"
                    class="w-3 h-3 opacity-50"
                  />
                  <span>
                    {{ formattedCursorTime }}
                  </span>
                </div>
              </div>
            </div>
          </template>

          <template #right>
            <SplitPane
              save-id="timeline-inspector"
            >
              <template #left>
                <TimelineEventList />
              </template>
              <template #right>
                <TimelineEventInspector />
              </template>
            </SplitPane>
          </template>
        </splitpane>
      </template>
    </SplitPane>

    <portal to="header-end">
      <VueDropdown>
        <template #trigger>
          <VueButton
            v-tooltip="'Select layers'"
            class="icon-button flat"
            icon-left="playlist_add"
          />
        </template>

        <div
          style="max-height: 250px;"
          class="overflow-x-hidden overflow-y-auto"
        >
          <div class="flex flex-col">
            <VueSwitch
              v-for="layer of allLayers"
              :key="layer.id"
              :value="!isLayerHidden(layer)"
              class="extend-left px-2 py-1 hover:bg-green-100 dark:hover:bg-green-900"
              @update="value => setLayerHidden(layer, !value)"
            >
              <div class="flex items-center space-x-2 max-w-xs">
                <div
                  class="flex-none w-3 h-3 rounded-full"
                  :style="{
                    backgroundColor: `#${layer.color.toString(16).padStart(6, '0')}`
                  }"
                />

                <div class="flex-1 truncate">
                  {{ layer.label }}
                </div>

                <PluginSourceIcon
                  v-if="layer.pluginId"
                  :plugin-id="layer.pluginId"
                  class="flex-none"
                />
              </div>
            </VueSwitch>
          </div>
        </div>
      </VueDropdown>

      <VueButton
        v-tooltip="'Clear all timelines'"
        class="icon-button flat"
        icon-left="delete_sweep"
        @click="resetTimeline()"
      />
    </portal>

    <portal to="more-menu">
      <VueSwitch
        v-model="$shared.timelineTimeGrid"
        class="w-full px-3 py-1 extend-left"
      >
        Time grid
      </VueSwitch>

      <VueSwitch
        v-if="supportsScreenshot"
        v-model="$shared.timelineScreenshots"
        class="w-full px-3 py-1 extend-left"
      >
        Screenshots
      </VueSwitch>

      <div class="border-t border-gray-200 dark:border-gray-800 my-1" />
    </portal>

    <AskScreenshotPermission
      v-if="askScreenshotPermission"
      class="ask-permission"
      @close="askScreenshotPermission = false"
    />
  </div>
</template>

<style lang="postcss" scoped>
.ask-permission {
  z-index: 11000;
}

.zoom-btn {
  @apply rounded-none;
  /deep/ .vue-ui-icon {
    @apply w-3.5 h-3.5 mr-0 left-0 right-0 !important;
  }
}
</style>
