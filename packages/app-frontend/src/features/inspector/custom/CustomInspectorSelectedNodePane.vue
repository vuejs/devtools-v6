<script lang="ts">
import EmptyPane from '@front/features/layout/EmptyPane.vue'

import { watch, defineComponent, ref } from 'vue'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { useBridge } from '@front/features/bridge'
import { useCurrentInspector } from './composable'
import StateInspector from '../StateInspector.vue'

export default defineComponent({
  components: {
    StateInspector,
    EmptyPane,
  },

  setup () {
    const {
      currentInspector: inspector,
      filteredState,
      refreshState,
      editState,
    } = useCurrentInspector()

    watch(() => inspector.value?.selectedNodeId, value => {
      if (value && !inspector.value.state) {
        refreshState()
      }
    })

    const stateInspector = ref(null)
    watch(() => inspector.value?.selectedNodeId, () => {
      if (stateInspector.value?.$el) {
        stateInspector.value.$el.scrollTop = 0
      }
    })

    // Custom actions
    const {
      bridge,
    } = useBridge()

    function executeCustomAction (index: number) {
      bridge.send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_ACTION, {
        inspectorId: inspector.value.id,
        appId: inspector.value.appId,
        actionIndex: index,
        actionType: 'nodeActions',
        args: [
          inspector.value.selectedNodeId,
        ],
      })
    }

    return {
      inspector,
      filteredState,
      editState,
      stateInspector,
      executeCustomAction,
    }
  },
})
</script>

<template>
  <div
    v-if="inspector.selectedNode"
    class="h-full flex flex-col"
  >
    <div class="px-2 h-8 box-content border-b border-gray-200 dark:border-gray-800 flex items-center flex-none">
      <div>
        {{ inspector.selectedNode.label }}
      </div>

      <VueInput
        v-model="inspector.stateFilter"
        icon-left="search"
        :placeholder="inspector.stateFilterPlaceholder || 'Filter state...'"
        class="search flex-1 flat ml-2"
      />

      <VueButton
        v-for="(action, index) of inspector.nodeActions"
        :key="index"
        v-tooltip="action.tooltip"
        class="icon-button flat"
        :icon-left="action.icon"
        @click="executeCustomAction(index)"
      />
    </div>

    <StateInspector
      v-if="inspector.state"
      ref="stateInspector"
      :state="filteredState"
      class="flex-1 overflow-y-auto"
      @edit-state="editState"
    />
  </div>

  <EmptyPane
    v-else-if="inspector.noSelectionText"
    :icon="inspector.icon"
  >
    {{ inspector.noSelectionText }}
  </EmptyPane>
</template>
