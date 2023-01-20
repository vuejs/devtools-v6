<script lang="ts">
import StateInspector from '@front/features/inspector/StateInspector.vue'
import EmptyPane from '@front/features/layout/EmptyPane.vue'
import RenderCode from './RenderCode.vue'

import { defineComponent, ref, watch, computed } from 'vue'
import { copyToClipboard, getComponentDisplayName, SharedData } from '@vue-devtools/shared-utils'
import { onKeyDown } from '@front/util/keyboard'
import { useSelectedComponent } from './composable'

export default defineComponent({
  components: {
    StateInspector,
    EmptyPane,
    RenderCode,
  },

  setup () {
    const selectedComponent = useSelectedComponent()
    const displayName = computed(() => getComponentDisplayName(selectedComponent.data.value?.name ?? '', SharedData.componentNameStyle))

    const showRenderCode = ref(false)

    // Auto scroll
    const { selectedComponentId } = selectedComponent
    const inspector = ref()
    watch(selectedComponentId, () => {
      if (inspector.value?.$el) {
        inspector.value.$el.scrollTop = 0
      }
    })

    // State filter
    const stateFilterInput = ref()
    onKeyDown(event => {
      if (event.key === 'd' && event.altKey) {
        stateFilterInput.value.focus()
        return false
      }
    }, true)

    const sameApp = computed(() => selectedComponent.data.value?.id.split(':')[0] === selectedComponentId.value?.split(':')[0])

    // Copy component name
    const showCopiedName = ref(false)
    let copiedNameTimeout
    function copyName () {
      copyToClipboard(displayName.value)
      showCopiedName.value = true
      clearTimeout(copiedNameTimeout)
      copiedNameTimeout = setTimeout(() => {
        showCopiedName.value = false
      }, 1000)
    }

    return {
      ...selectedComponent,
      displayName,
      showRenderCode,
      inspector,
      stateFilterInput,
      sameApp,
      copyName,
      showCopiedName,
    }
  },
})
</script>

<template>
  <div
    v-if="data && sameApp"
    class="h-full flex flex-col relative"
  >
    <div class="px-2 h-8 box-content border-b border-gray-200 dark:border-gray-800 flex items-center flex-none">
      <VTooltip
        :shown="showCopiedName"
        :triggers="[]"
        :delay="0"
        class="flex items-baseline cursor-pointer"
        @click.native="copyName()"
      >
        <span class="text-gray-500">&lt;</span>
        <span class="text-green-500">
          {{ displayName }}
        </span>
        <span class="text-gray-500">&gt;</span>

        <template #popper>
          Copied!
        </template>
      </VTooltip>

      <VueInput
        ref="stateFilterInput"
        v-model="stateFilter"
        v-tooltip="{
          content: $t('StateInspector.filter.tooltip'),
          html: true
        }"
        icon-left="search"
        placeholder="Filter state..."
        class="search flex-1 flat min-w-0"
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
