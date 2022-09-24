<script lang="ts">
import { defineComponent } from 'vue'

// import NewTag from './NewTag.vue'

// export default {
//   components: {
//     NewTag
//   }
// }

export default defineComponent({})
</script>

<template>
  <div class="global-preferences">
    <div class="preferences">
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
        title="Debugging info"
      >
        <VueSwitch v-model="$shared.debugInfo">
          Enable
        </VueSwitch>
      </VueFormField>
    </div>

    <portal to="header-end">
      <VueButton
        :to="{
          name: 'plugins'
        }"
        icon-left="extension"
        class="flat"
      >
        Plugin settings
      </VueButton>
    </portal>
  </div>
</template>
