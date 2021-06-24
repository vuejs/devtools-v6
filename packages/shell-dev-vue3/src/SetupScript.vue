<script setup>
import Child from './Child.vue'
import { ref, computed, reactive } from 'vue'

const myObj = reactive({
  foo: 'bar'
})

const count = ref(0)

const double = computed(() => count.value * 2)

const answer = 42

function onClick () {
  count.value++
}
</script>

<template>
  {{ count }}
  {{ double }}

  <button @click="onClick">
    +1
  </button>

  <Child />
</template>
