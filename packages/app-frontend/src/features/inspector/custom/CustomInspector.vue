<script lang="ts">
import SplitPane from '@front/features/layout/SplitPane.vue'
import EmptyPane from '@front/features/layout/EmptyPane.vue'
import CustomInspectorNode from './CustomInspectorNode.vue'
import CustomInspectorSelectedNodePane from './CustomInspectorSelectedNodePane.vue'

import { watch, ref, provide, defineComponent } from '@vue/composition-api'
import { useCurrentInspector } from './composable'

export default defineComponent({
  components: {
    SplitPane,
    EmptyPane,
    CustomInspectorNode,
    CustomInspectorSelectedNodePane
  },

  setup () {
    const {
      currentInspector: inspector,
      refreshInspector,
      refreshTree
    } = useCurrentInspector()

    watch(() => inspector.value && inspector.value.treeFilter, () => {
      refreshTree()
    })

    watch(inspector, () => {
      refreshInspector()
    }, {
      immediate: true
    })

    // Scroller

    const treeScroller = ref()
    provide('treeScroller', treeScroller)

    return {
      inspector,
      refreshInspector,
      treeScroller
    }
  }
})
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
            class="search flat border-b border-gray-200 dark:border-gray-800"
          />

          <div
            ref="treeScroller"
            class="flex-1 p-2 overflow-auto"
          >
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
  <EmptyPane
    v-else
    icon="explore"
    class="wait"
  >
    <div class="flex flex-col items-center">
      <div>Inspector {{ $route.params.inspectorId }} not found</div>
      <a
        class="text-green-500 hover:underline cursor-pointer"
        @click="$router.replace({ name: 'inspector-components' })"
      >Go back</a>
    </div>
  </EmptyPane>
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

.wait {
  animation: wait 1s;
}

@keyframes wait {
  0%, 99% {
    visibility: hidden;
  }
  100% {
    visibility: visible;
  }
}
</style>
