<script>
import SplitPane from '@front/features/layout/SplitPane.vue'
import TimelineView from './TimelineView.vue'
import TimelineScrollbar from './TimelineScrollbar.vue'
import LayerItem from './LayerItem.vue'
import SelectedEventInspector from './SelectedEventInspector.vue'

import { useTime, useLayers, resetTimeline } from '.'
import { onMounted, ref, watch } from '@vue/composition-api'

export default {
  components: {
    SplitPane,
    LayerItem,
    TimelineView,
    TimelineScrollbar,
    SelectedEventInspector
  },

  setup () {
    const {
      layers,
      vScroll,
      allLayers,
      isLayerHidden,
      setLayerHidden,
      hoverLayerId
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

    return {
      ...useTime(),
      layers,
      vScroll,
      layersEl,
      onLayersScroll,
      hoverLayerId,
      allLayers,
      isLayerHidden,
      setLayerHidden,
      resetTimeline
    }
  }
}
</script>

<template>
  <div>
    <SplitPane
      :default-split="25"
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
              class="flex-none"
              @mouseover.native="hoverLayerId = layer.id"
              @mouseout.native="hoverLayerId = null"
            />
          </div>
        </div>
      </template>

      <template #right>
        <SplitPane
          :default-split="80"
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
            </div>
          </template>

          <template #right>
            <SelectedEventInspector />
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
              {{ layer.label }}
            </VueSwitch>
          </div>
        </div>
      </VueDropdown>

      <VueButton
        v-tooltip="'Clear all timelines'"
        class="icon-button flat"
        icon-left="delete"
        @click="resetTimeline()"
      />
    </portal>
  </div>
</template>
