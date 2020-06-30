<script>
import Child from './Child.vue'

export default {
  components: {
    Child
  }
}
</script>

<template>
  <div>
    <h3>Nest children</h3>
    <Child
      v-for="i in 4"
      :key="i"
    />
    <div>
      <Child
        v-for="i in 4"
        :key="i"
      />
    </div>
  </div>
</template>
