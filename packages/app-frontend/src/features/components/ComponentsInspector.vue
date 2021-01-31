<script>
import { onMounted } from '@vue/composition-api'
import { useComponents } from '.'
import { useComponentPick } from './pick'
import SplitPane from '@front/features/layout/SplitPane.vue'
import ComponentTreeNode from './ComponentTreeNode.vue'
import SelectedComponentPane from './SelectedComponentPane.vue'
import { onKeyUp } from '@front/util/keyboard'

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

    // Pick

    const {
      pickingComponent,
      startPickingComponent,
      stopPickingComponent
    } = useComponentPick()

    onKeyUp(event => {
      console.log(event.key)
      if (event.key === 's' && !pickingComponent.value) {
        startPickingComponent()
      } else if (event.key === 'Escape' && pickingComponent.value) {
        stopPickingComponent()
      }
    })

    return {
      rootInstances,
      treeFilter,
      pickingComponent,
      startPickingComponent,
      stopPickingComponent
    }
  }
}
</script>

<template>
  <div>
    <SplitPane
      save-id="components-inspector"
    >
      <template #left>
        <div class="flex flex-col h-full">
          <VueInput
            v-model="treeFilter"
            icon-left="search"
            placeholder="Find components..."
            class="search flat border-b border-gray-200 dark:border-gray-900"
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
