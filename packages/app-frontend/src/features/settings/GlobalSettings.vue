<script lang="ts" setup>
import { ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import { clearStorage } from '@vue-devtools/shared-utils'
import { supportsScreenshot } from '../timeline/composable/screenshot'

type Tab = 'global' | 'components' | 'timeline'

const tab = ref<Tab>('global')

const hideAppSelector = useLocalStorage('split-pane-collapsed-left-app-select-pane', false)
const hideTimelineCanvas = useLocalStorage('split-pane-collapsed-left-timeline-right', false)
const hideEvents = useLocalStorage('split-pane-collapsed-right-timeline-right', false)

const confirmClearStorage = ref(false)
</script>

<template>
  <div class="global-preferences p-6">
    <nav class="flex items-center gap-2 pb-4">
      <VueGroup
        v-model="tab"
        indicator
      >
        <VueGroupButton
          value="global"
          label="Global"
          class="flat"
        />
        <VueGroupButton
          value="components"
          label="Components"
          class="flat"
        />
        <VueGroupButton
          value="timeline"
          label="Timeline"
          class="flat"
        />
      </VueGroup>

      <VueButton
        :to="{
          name: 'plugins',
        }"
        icon-left="extension"
        icon-right="arrow_forward"
        class="flat"
      >
        Plugin settings
      </VueButton>
    </nav>

    <div v-if="tab === 'global'" class="preferences flex flex-wrap gap-8">
      <VueFormField title="Theme">
        <VueGroup
          v-model="$shared.theme"
          class="extend w-96"
        >
          <VueGroupButton
            value="auto"
            label="Auto"
          />
          <VueGroupButton
            value="light"
            label="Light"
          />
          <VueGroupButton
            value="dark"
            label="Dark"
          />
          <VueGroupButton
            value="high-contrast"
            label="High contrast"
          />
        </VueGroup>
      </VueFormField>

      <VueFormField
        title="Main layout"
      >
        <VueSwitch v-model="hideAppSelector">
          Collapse app selector
        </VueSwitch>
      </VueFormField>

      <VueFormField
        title="Menu Step Scrolling"
      >
        <VueSwitch v-model="$shared.menuStepScrolling">
          Enable
        </VueSwitch>
        <template #subtitle>
          Useful for trackpads
        </template>
      </VueFormField>

      <VueFormField
        title="Debugging info"
      >
        <VueSwitch v-model="$shared.debugInfo">
          Enable
        </VueSwitch>

        <VueButton
          @click="confirmClearStorage = true"
        >
          Clear storage
        </VueButton>
      </VueFormField>
    </div>

    <div v-if="tab === 'components'" class="preferences flex flex-wrap gap-8">
      <VueFormField
        title="Component names"
      >
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
      </VueFormField>

      <VueFormField
        title="Performance monitoring"
      >
        <VueSwitch v-model="$shared.performanceMonitoringEnabled">
          Enable
        </VueSwitch>
        <template #subtitle>
          Turn off if your app is slowed down
        </template>
      </VueFormField>

      <VueFormField
        title="Update tracking"
      >
        <VueSwitch v-model="$shared.trackUpdates">
          Enable
        </VueSwitch>
        <template #subtitle>
          Turn off if your app is slowed down
        </template>
      </VueFormField>

      <VueFormField
        title="Editable props"
      >
        <VueSwitch v-model="$shared.editableProps">
          Enable
        </VueSwitch>
        <template #subtitle>
          May print warnings in the console
        </template>
      </VueFormField>

      <VueFormField
        title="Highlight updates"
      >
        <VueSwitch v-model="$shared.flashUpdates">
          Enable
        </VueSwitch>
        <template #subtitle>
          Don't enable if you are sensitive to flashing
        </template>
      </VueFormField>
    </div>

    <div v-if="tab === 'timeline'" class="preferences flex flex-wrap gap-8">
      <VueFormField
        title="Layout"
      >
        <VueSwitch v-model="hideTimelineCanvas">
          Hide timeline canvas
        </VueSwitch>
        <VueSwitch v-model="hideEvents">
          Hide events explorer
        </VueSwitch>
      </VueFormField>

      <VueFormField
        title="Time grid"
      >
        <VueSwitch v-model="$shared.timelineTimeGrid">
          Enable
        </VueSwitch>
      </VueFormField>

      <VueFormField
        v-if="supportsScreenshot"
        title="Screenshots"
      >
        <VueSwitch v-model="$shared.timelineScreenshots">
          Enable
        </VueSwitch>
      </VueFormField>
    </div>

    <VueModal
      v-if="confirmClearStorage"
      title="Clear storage"
      @close="confirmClearStorage = false"
    >
      <div class="p-6 space-y-6">
        <p>
          Are you sure you want to clear all storage?
        </p>
        <div class="flex justify-end gap-2">
          <VueButton
            @click="confirmClearStorage = false"
          >
            Cancel
          </VueButton>
          <VueButton
            class="danger"
            @click="clearStorage();confirmClearStorage = false"
          >
            Clear
          </VueButton>
        </div>
      </div>
    </VueModal>
  </div>
</template>

<style lang="postcss" scoped>
.preferences {

  .vue-ui-form-field {
    > .wrapper > .content {
      min-height: 32px;
      justify-content: center;
    }
  }
}
</style>
