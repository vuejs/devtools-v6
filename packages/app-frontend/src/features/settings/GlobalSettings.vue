<template>
  <div class="global-preferences preferences">
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
  </div>
</template>

<script>
// import NewTag from './NewTag.vue'

// export default {
//   components: {
//     NewTag
//   }
// }
</script>
