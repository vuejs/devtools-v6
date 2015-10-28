<template>
  <div>
    <instance
      v-for="i in instances"
      track-by="id"
      :instance="i">
    </instance>
  </div>
</template>

<script>
import Instance from './Instance.vue'

export default {
  name: 'Tree',
  components: { Instance },
  props: {
    instances: Array
  }
}
</script>
