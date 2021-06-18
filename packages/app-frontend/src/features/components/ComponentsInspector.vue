<script lang="ts">
import SplitPane from '@front/features/layout/SplitPane.vue'
import ComponentTreeNode from './ComponentTreeNode.vue'
import SelectedComponentPane from './SelectedComponentPane.vue'

import { onMounted, ref, provide, defineComponent, computed } from '@vue/composition-api'
import { onKeyDown, onKeyUp } from '@front/util/keyboard'
import { useComponentPick, useComponents, loadComponent } from './composable'

export default defineComponent({
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
      subscribeToSelectedData,
      selectedComponentId
    } = useComponents()

    subscribeToSelectedData()

    onMounted(() => {
      requestComponentTree(null)
      selectLastComponent()
    })

    const treeFilterInput = ref()

    // Pick

    const {
      pickingComponent,
      startPickingComponent,
      stopPickingComponent
    } = useComponentPick()

    onKeyDown(event => {
      if (event.key === 'f' && event.ctrlKey) {
        treeFilterInput.value.focus()
        return false
      }
    })

    onKeyUp(event => {
      if (event.key === 's' && !pickingComponent.value) {
        startPickingComponent()
      } else if (event.key === 'Escape' && pickingComponent.value) {
        stopPickingComponent()
      }
    })

    // Refresh

    function refresh () {
      requestComponentTree(null)
      loadComponent(selectedComponentId.value)
    }

    // Scroller

    const treeScroller = ref()
    provide('treeScroller', treeScroller)

    return {
      rootInstances,
      treeFilter,
      treeFilterInput,
      pickingComponent,
      startPickingComponent,
      stopPickingComponent,
      refresh,
      treeScroller
    }
  }
})
</script>

<template>
  <div>
    <SplitPane
      save-id="components-inspector"
    >
      <template #left>
        <div class="flex flex-col h-full">
          <VueInput
            ref="treeFilterInput"
            v-model="treeFilter"
            icon-left="search"
            placeholder="Find components..."
            select-all
            class="search flat border-b border-gray-200 dark:border-gray-800"
          />

          <div
            ref="treeScroller"
            class="flex-1 p-2 overflow-auto"
          >
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
      <div class="space-y-1 px-3 py-2 text-sm">
        <div>Component names:</div>

        <VueGroup
          v-model="$shared.componentNameStyle"
        >
          <VueGroupButton
            value="original"
            label="Original"
          />
          <VueGroupButton
            value="class"
            label="PascalCase"
          />
          <VueGroupButton
            value="kebab"
            label="kebab-case"
          />
        </VueGroup>
      </div>

      <div class="space-y-1 px-3 py-2 text-sm">
        <VueSwitch v-model="$shared.editableProps">
          Editable props
        </VueSwitch>
        <div class="flex items-center space-x-1 text-xs opacity-50">
          <VueIcon
            icon="warning"
            class="w-4 h-4 flex-none"
          />
          <span>May print warnings in the console</span>
        </div>
      </div>

      <div class="border-t border-gray-200 dark:border-gray-800 my-1" />
    </portal>

    <portal to="header-end">
      <VueButton
        v-tooltip="{
          content: $t('ComponentTree.select.tooltip'),
          html: true
        }"
        class="icon-button flat"
        icon-left="gps_fixed"
        @click="startPickingComponent()"
      />

      <VueButton
        v-tooltip="'Force refresh'"
        class="icon-button flat"
        icon-left="refresh"
        @click="refresh()"
      />
    </portal>

    <portal to="root">
      <transition name="vue-ui-fade">
        <div
          v-if="pickingComponent"
          class="absolute inset-0 bg-white bg-opacity-75 dark:bg-black dark:bg-opacity-75 z-100 flex items-center justify-center"
        >
          <div class="flex flex-col items-center justify-center space-y-4 px-8 py-6 rounded-lg shadow-lg bg-white dark:bg-gray-900">
            <VueIcon
              icon="gps_fixed"
              class="w-8 h-8 text-green-500 animate-pulse"
            />
            <div>
              Click on a component on the page to select it
            </div>
            <div>
              <VueButton
                @click="stopPickingComponent()"
              >
                Cancel
              </VueButton>
            </div>
          </div>
        </div>
      </transition>
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
