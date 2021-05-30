<script lang="ts">
import StateInspector from '@front/features/inspector/StateInspector.vue'
import EmptyPane from '@front/features/layout/EmptyPane.vue'
import RenderCode from './RenderCode.vue'

import { defineComponent, ref, watch } from '@vue/composition-api'
import { useSelectedComponent } from './composable'

export default defineComponent({
  components: {
    StateInspector,
    EmptyPane,
    RenderCode
  },

  setup () {
    const selectedComponent = useSelectedComponent()
    const showRenderCode = ref(false)

    const { selectedComponentId } = selectedComponent
    const inspector = ref()
    watch(selectedComponentId, () => {
      if (inspector.value?.$el) {
        inspector.value.$el.scrollTop = 0
      }
    })

    return {
      ...selectedComponent,
      showRenderCode,
      inspector
    }
  }
})
</script>

<template>
  <div
    v-if="data"
    class="h-full flex flex-col relative"
  >
    <div class="px-2 h-10 border-b border-gray-200 dark:border-gray-800 flex items-center flex-none">
      <div class="flex items-baseline">
        <span class="text-gray-500">&lt;</span>
        <span class="text-green-500">
          {{ data.name }}
        </span>
        <span class="text-gray-500">&gt;</span>
      </div>

      <VueInput
        v-model="stateFilter"
        icon-left="search"
        placeholder="Filter state..."
        class="search flex-1 flat"
      />

      <VueButton
        v-tooltip="'Scroll to component'"
        icon-left="preview"
        class="flat icon-button"
        @click="scrollToComponent()"
      />

      <VueButton
        v-tooltip="'Show render code'"
        icon-left="code"
        class="flat icon-button"
        @click="showRenderCode = true"
      />

      <VueButton
        v-if="$isChrome"
        v-tooltip="'Inspect DOM'"
        icon-left="menu_open"
        class="flat icon-button"
        @click="inspectDOM()"
      />

      <VueButton
        v-if="fileIsPath"
        v-tooltip="{
          content: $t('ComponentInspector.openInEditor.tooltip', { file: data.file }),
          html: true
        }"
        icon-left="launch"
        class="flat icon-button"
        @click="openFile()"
      />
    </div>

    <VueLoadingBar
      v-if="data && data.id !== selectedComponentId"
      unknown
      class="primary ghost"
    />

    <StateInspector
      ref="inspector"
      :state="state"
      class="flex-1 overflow-y-auto"
      :class="{
        'grayscale': data && data.id !== selectedComponentId
      }"
      @edit-state="editState"
    />

    <RenderCode
      v-if="showRenderCode"
      :instance-id="selectedComponentId"
      class="absolute inset-0 w-full h-full z-10"
      @close="showRenderCode = false"
    />
  </div>

  <EmptyPane
    v-else
    icon="device_hub"
  >
    Select a component
  </EmptyPane>
</template>
