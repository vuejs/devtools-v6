<script>
import { onMounted } from '@vue/composition-api'
import { useComponents } from '.'
import SplitPane from '@front/features/layout/SplitPane.vue'
import ComponentTreeNode from './ComponentTreeNode.vue'
import SelectedComponentPane from './SelectedComponentPane.vue'

export default {
  components: {
    SplitPane,
    ComponentTreeNode,
    SelectedComponentPane
  },

  setup () {
    const {
      rootInstances,
      requestComponentTree,
      treeFilter,
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
      treeFilter
    }
  }
}
</script>

<template>
  <div>
    <SplitPane>
      <template #left>
        <div class="flex flex-col h-full">
          <VueInput
            v-model="treeFilter"
            icon-left="search"
            placeholder="Filter components..."
            class="search border-b border-gray-200 dark:border-gray-800"
          />

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
        <SelectedComponentPane />
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

<style lang="postcss" scoped>
.search {
  >>> {
    .input {
      height: 39px !important;
    }

    .content {
      border: none !important;
    }
  }
}
</style>
