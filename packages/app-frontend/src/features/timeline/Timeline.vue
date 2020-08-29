<script>
import SplitPane from '@front/features/layout/SplitPane.vue'
import TimelineView from './TimelineView.vue'
import TimelineScrollbar from './TimelineScrollbar.vue'
import LayerItem from './LayerItem.vue'
import SelectedEventInspector from './SelectedEventInspector.vue'

import { useTime, useLayers, resetTimeline } from '.'

export default {
  components: {
    SplitPane,
    LayerItem,
    TimelineView,
    TimelineScrollbar,
    SelectedEventInspector
  },

  setup () {
    return {
      ...useTime(),
      ...useLayers(),
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
        <div class="flex flex-col h-full overflow-auto">
          <div class="h-4 border-b border-gray-200 dark:border-gray-900" />

          <LayerItem
            v-for="layer of layers"
            :key="layer.id"
            :layer="layer"
          />
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
      <VueButton
        v-tooltip="'Clear all timelines'"
        class="icon-button flat"
        icon-left="delete"
        @click="resetTimeline()"
      />
    </portal>
  </div>
</template>
