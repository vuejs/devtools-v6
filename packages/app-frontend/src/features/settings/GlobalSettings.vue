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
