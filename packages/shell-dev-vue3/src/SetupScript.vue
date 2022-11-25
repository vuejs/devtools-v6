<script setup>
import Child from './Child.vue'
import { ref, computed, reactive } from 'vue'
import { useStore } from 'vuex'
import { useRouter } from 'vue-router'

const myObj = reactive({
  foo: 'bar',
})

const count = ref(0)

const double = computed(() => count.value * 2)

const answer = 42

const state2 = reactive({
  n: ref(0),
})

function onClick () {
  count.value++
}

const throws = computed(() => { throw new Error('oops') })

const store = useStore()
const throwsWithVuex = computed(() => store.getters.throws)

const router = useRouter()
</script>

<template>
  {{ count }}
  {{ double }}

  <button @click="onClick">
    +1
  </button>

  <Child />

  <pre>{{ state2 }}</pre>
</template>
