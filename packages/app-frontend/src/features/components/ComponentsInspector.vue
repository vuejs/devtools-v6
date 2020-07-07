<script>
import { onMounted } from '@vue/composition-api'
import { useComponents } from '.'
import SplitPane from '@front/features/layout/SplitPane.vue'
import ComponentTreeNode from './ComponentTreeNode.vue'
import StateInspector from '@front/features/inspector/StateInspector.vue'

export default {
  components: {
    SplitPane,
    ComponentTreeNode,
    StateInspector
  },

  setup () {
    const {
      rootInstances,
      requestComponentTree,
      selectedComponentData,
      selectedComponentState,
      selectLastComponent,
      subscribeToSelectedData
    } = useComponents()

    subscribeToSelectedData()

    onMounted(() => {
      requestComponentTree(null)
      selectLastComponent()
    })

    return {
      rootInstances,
      selectedComponentData,
      selectedComponentState
    }
  }
}
</script>

<template>
  <div>
    <SplitPane>
      <template #left>
        <div class="flex flex-col h-full">
          <!-- @TODO search -->

          <div class="flex-1 p-2 overflow-auto">
            <ComponentTreeNode
              v-for="instance of rootInstances"
              :key="instance.id"
              :instance="instance"
            />
          </div>
        </div>
      </template>

      <template #right>
        <template v-if="selectedComponentData">
          <div class="px-2 h-10 border-b border-gray-200 dark:border-gray-800 flex items-center">
            <div class="flex items-baseline">
              <span class="text-gray-500">&lt;</span>
              <span class="text-green-500">
                {{ selectedComponentData.name }}
              </span>
              <span class="text-gray-500">&gt;</span>
            </div>
          </div>

          <StateInspector
            :state="selectedComponentState"
          />
        </template>
      </template>
    </SplitPane>

    <portal to="more-menu">
      <div class="space-y-1 px-4 py-2 text-sm">
        <div>Component names:</div>

        <VueGroup
          v-model="$shared.componentNameStyle"
        >
          <VueGroupButton
            value="original"
            label="Original name"
          />
          <VueGroupButton
            value="class"
            label="Pascal case"
          />
          <VueGroupButton
            value="kebab"
            label="Kebab case"
          />
        </VueGroup>
      </div>
    </portal>
  </div>
</template>
