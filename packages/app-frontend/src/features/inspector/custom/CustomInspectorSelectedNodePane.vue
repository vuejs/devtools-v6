<script lang="ts">
import EmptyPane from '@front/features/layout/EmptyPane.vue'

import { watch, defineComponent, ref } from '@vue/composition-api'
import { useCurrentInspector } from './composable'
import StateInspector from '../StateInspector.vue'

export default defineComponent({
  components: {
    StateInspector,
    EmptyPane
  },

  setup () {
    const {
      currentInspector: inspector,
      filteredState,
      refreshState,
      editState
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

    return {
      inspector,
      filteredState,
      editState,
      stateInspector
    }
  }
})
</script>

<template>
  <div
    v-if="inspector.selectedNode"
    class="h-full flex flex-col"
  >
    <div class="px-2 h-10 border-b border-gray-200 dark:border-gray-800 flex items-center flex-none">
      <div>
        {{ inspector.selectedNode.label }}
      </div>

      <VueInput
        v-model="inspector.stateFilter"
        icon-left="search"
        :placeholder="inspector.stateFilterPlaceholder || 'Filter state...'"
        class="search flex-1 flat ml-2"
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
