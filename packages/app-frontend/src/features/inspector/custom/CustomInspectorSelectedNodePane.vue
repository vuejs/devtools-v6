<script>
import { watch } from '@vue/composition-api'
import { useCurrentInspector } from '.'
import StateInspector from '../StateInspector.vue'

export default {
  components: {
    StateInspector
  },

  setup () {
    const {
      currentInspector: inspector,
      filteredState,
      refreshState,
      editState
    } = useCurrentInspector()

    watch(() => inspector.value && inspector.value.selectedNode, value => {
      if (value && !inspector.state) {
        refreshState()
      }
    })

    return {
      inspector,
      filteredState,
      editState
    }
  }
}
</script>

<template>
  <div
    v-if="inspector.selectedNode"
    class="h-full flex flex-col"
  >
    <div class="px-2 h-10 border-b border-gray-200 dark:border-gray-900 flex items-center flex-none">
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
      :state="filteredState"
      class="flex-1 overflow-y-auto"
      @edit-state="editState"
    />
  </div>
</template>
