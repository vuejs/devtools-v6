<script lang="ts">
import SplitPane from '@front/features/layout/SplitPane.vue'
import EmptyPane from '@front/features/layout/EmptyPane.vue'
import CustomInspectorNode from './CustomInspectorNode.vue'
import CustomInspectorSelectedNodePane from './CustomInspectorSelectedNodePane.vue'

import { watch, ref, provide, defineComponent } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { useBridge } from '@front/features/bridge'
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
      refreshTree,
      selectNode
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

    // Keyboard

    function selectNextChild (index) {
      if (index + 1 < inspector.value.rootNodes.length) {
        selectNode(inspector.value.rootNodes[index + 1])
      }
    }

    function selectPreviousChild (index) {
      if (index - 1 >= 0) {
        selectNode(inspector.value.rootNodes[index - 1])
      }
    }

    // Custom actions
    const {
      bridge
    } = useBridge()

    function executeCustomAction (index: number) {
      bridge.send(BridgeEvents.TO_BACK_CUSTOM_INSPECTOR_ACTION, {
        inspectorId: inspector.value.id,
        appId: inspector.value.appId,
        actionIndex: index
      })
    }

    return {
      inspector,
      refreshInspector,
      treeScroller,
      selectNextChild,
      selectPreviousChild,
      executeCustomAction
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
              v-for="(node, index) of inspector.rootNodes"
              :key="node.id"
              :node="node"
              @select-next-sibling="selectNextChild(index)"
              @select-previous-sibling="selectPreviousChild(index)"
            />
          </div>
        </div>
      </template>

      <template #right>
        <CustomInspectorSelectedNodePane />
      </template>
    </SplitPane>

    <portal to="header-end">
      <template v-if="inspector.actions">
        <VueButton
          v-for="(action, index) of inspector.actions"
          :key="index"
          v-tooltip="action.tooltip"
          class="icon-button flat"
          :icon-left="action.icon"
          @click="executeCustomAction(index)"
        />
      </template>
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
