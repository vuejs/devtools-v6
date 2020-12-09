<script>
import { watch } from '@vue/composition-api'
import SplitPane from '@front/features/layout/SplitPane.vue'
import CustomInspectorNode from './CustomInspectorNode.vue'
import CustomInspectorSelectedNodePane from './CustomInspectorSelectedNodePane.vue'
import { useCurrentInspector } from '.'

export default {
  components: {
    SplitPane,
    CustomInspectorNode,
    CustomInspectorSelectedNodePane
  },

  setup () {
    const {
      currentInspector: inspector,
      refreshInspector,
      refreshTree
    } = useCurrentInspector()

    watch(() => inspector.value && inspector.value.treeFilter, (value) => {
      refreshTree()
    })

    watch(inspector, () => {
      refreshInspector()
    }, {
      immediate: true
    })

    return {
      inspector,
      refreshInspector
    }
  }
}
</script>

<template>
  <div v-if="inspector">
    <SplitPane
      :save-id="`custom-inspector-${inspector.id}`"
    >
      <template #left>
        <div class="flex flex-col h-full">
          <VueInput
            v-model="inspector.treeFilter"
            icon-left="search"
            :placeholder="inspector.treeFilterPlaceholder || 'Search...'"
            class="search flat border-b border-gray-200 dark:border-gray-900"
          />

          <div class="flex-1 p-2 overflow-auto">
            <CustomInspectorNode
              v-for="node of inspector.rootNodes"
              :key="node.id"
              :node="node"
            />
          </div>
        </div>
      </template>

      <template #right>
        <CustomInspectorSelectedNodePane />
      </template>
    </SplitPane>

    <portal to="header-end">
      <VueButton
        v-tooltip="'Refresh'"
        class="icon-button flat"
        icon-left="refresh"
        @click="refreshInspector()"
      />
    </portal>
  </div>
  <div
    v-else
    class="flex items-center justify-center text-opacity-50"
  >
    Inspector {{ $route.params.inspectorId }} not found
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
