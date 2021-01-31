<script>
import SplitPane from '@front/features/layout/SplitPane.vue'
import TimelineView from './TimelineView.vue'
import TimelineScrollbar from './TimelineScrollbar.vue'
import LayerItem from './LayerItem.vue'
import TimelineEventList from './TimelineEventList.vue'
import TimelineEventInspector from './TimelineEventInspector.vue'

import { useTime, useLayers, resetTimeline, useCursor, useSelectedEvent, useScreenshots } from '.'
import { computed, onMounted, ref, watch } from '@vue/composition-api'
import { formatTime } from '@front/util/format'
import SharedData from '@utils/shared-data'
import { onSharedDataChange } from '../../util/shared-data'
import AskScreenshotPermission from './AskScreenshotPermission.vue'
import PluginSourceIcon from '../plugin/PluginSourceIcon.vue'

export default {
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
      selectedEventLayerId
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

    function onLayersScroll (event) {
      if (event.currentTarget.scrollTop !== vScroll.value) {
        vScroll.value = event.currentTarget.scrollTop
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
      selectedEventLayerId,
      allLayers,
      isLayerHidden,
      setLayerHidden,
      resetTimeline,
      formattedCursorTime,
      askScreenshotPermission
    }
  }
}
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
          <div class="h-4 flex-none border-b border-gray-200 dark:border-gray-900" />

          <div
            ref="layersEl"
            class="flex flex-col flex-1 overflow-y-auto"
            @scroll="onLayersScroll"
          >
            <LayerItem
              v-for="layer of layers"
              :key="layer.id"
              :layer="layer"
              :hover="hoverLayerId === layer.id"
              :selected="selectedEventLayerId === layer.id"
              class="flex-none"
              @mouseover.native="hoverLayerId = layer.id"
              @mouseout.native="hoverLayerId = null"
            />
          </div>
        </div>
      </template>

      <template #right>
        <SplitPane
          save-id="timeline-right"
          :default-split="70"
          :max="85"
          dragger-offset="after"
        >
          <template #left>
            <div class="h-full flex flex-col">
              <TimelineScrollbar
                :min.sync="minTime"
                :max.sync="maxTime"
                :start.sync="startTime"
                :end.sync="endTime"
                class="flex-none"
              />
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
          class="overflow-y-auto"
        >
          <div class="flex flex-col">
            <VueSwitch
              v-for="layer of allLayers"
              :key="layer.id"
              :value="!isLayerHidden(layer)"
              class="extend-left px-2 py-1 hover:bg-green-100 dark-hover:bg-green-900"
              @update="value => setLayerHidden(layer, !value)"
            >
              <div class="flex items-center space-x-2">
                <div
                  class="flex-none w-3 h-3 rounded-full"
                  :style="{
                    backgroundColor: `#${layer.color.toString(16)}`
                  }"
                />

                <span>{{ layer.label }}</span>

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
        class="w-full px-4 py-1 extend-left"
      >
        Time grid
      </VueSwitch>

      <VueSwitch
        v-model="$shared.timelineScreenshots"
        class="w-full px-4 py-1 extend-left"
      >
        Screenshots
      </VueSwitch>
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
</style>
