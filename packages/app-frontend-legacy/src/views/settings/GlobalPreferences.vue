<template>
  <div class="global-preferences preferences">
    <VueFormField title="Normalize component names">
      <VueGroup
        v-model="$shared.componentNameStyle"
        class="extend"
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
    </VueFormField>

    <VueFormField title="Theme">
      <VueGroup
        v-model="$shared.theme"
        class="extend"
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

    <VueFormField title="Display density">
      <VueGroup
        v-model="$shared.displayDensity"
        class="extend"
      >
        <VueGroupButton
          value="auto"
          label="Auto"
        />
        <VueGroupButton
          value="low"
          label="Low"
        />
        <VueGroupButton
          value="high"
          label="High"
        />
      </VueGroup>
    </VueFormField>

    <VueFormField
      title="Editable props"
    >
      <VueSwitch v-model="$shared.editableProps">
        Enable
      </VueSwitch>
      <template #subtitle>
        <VueIcon
          icon="warning"
          class="medium"
        />
        May print warnings in the console
      </template>
    </VueFormField>

    <VueFormField title="Time Format">
      <VueSwitch
        :value="$shared.timeFormat === 'ms'"
        @update="value => $shared.timeFormat = value ? 'ms' : 'default'"
      >
        Display milliseconds
      </VueSwitch>
    </VueFormField>

    <VueFormField title="Detected Vue message">
      <VueSwitch v-model="$shared.logDetected">
        Display in browser console
      </VueSwitch>
    </VueFormField>

    <VueFormField>
      <template #title>
        New Vuex backend
        <NewTag :version="2" />
      </template>
      <VueSwitch v-model="$shared.vuexNewBackend">
        Enable
      </VueSwitch>
      <template #subtitle>
        Faster and less memory-intensive
      </template>
    </VueFormField>

    <VueFormField
      title="Autoload Vuex state"
    >
      <VueSwitch v-model="$shared.vuexAutoload">
        Enable
      </VueSwitch>
      <template #subtitle>
        <VueIcon
          icon="warning"
          class="medium"
        />
        May impact performance or cause crashes
      </template>
    </VueFormField>

    <VueFormField>
      <template #title>
        Group getters by module
        <NewTag :version="2" />
      </template>
      <VueSwitch v-model="$shared.vuexGroupGettersByModule">
        Enable
      </VueSwitch>
    </VueFormField>
  </div>
</template>

<script>
import NewTag from './NewTag.vue'

export default {
  components: {
    NewTag
  }
}
</script>
