<script setup>
import { ref } from 'vue'
import Child from './Child.vue'
import SetupScript from './SetupScript.vue'

const msg = ref('msg')
</script>

<script>
export default {
  name: 'IframeApp',
}
</script>

<template>
  <p>{{ msg }}</p>
  <div>
    <input v-model="msg">
  </div>

  <Child />
  <SetupScript />
</template>
