<script>
import StateInspector from '@front/features/inspector/StateInspector.vue'
import { useSelectedComponent } from '.'

export default {
  components: {
    StateInspector
  },

  setup () {
    return {
      ...useSelectedComponent()
    }
  }
}
</script>

<template>
  <div
    v-if="data"
    class="h-full flex flex-col"
  >
    <div class="px-2 h-10 border-b border-gray-200 dark:border-gray-900 flex items-center flex-none">
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
        v-if="$isChrome"
        v-tooltip="'Inspect DOM'"
        icon-left="code"
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

    <StateInspector
      :state="state"
      class="flex-1 overflow-y-auto"
      @edit-state="editState"
    />
  </div>
</template>
