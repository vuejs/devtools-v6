<script>
import Child from './Child.vue'

export default {
  components: {
    Child
  },

  props: {
    count: {
      type: Number,
      default: 4
    }
  }
}
</script>

<template>
  <div>
    <h3>Nest children</h3>
    <Child
      v-for="i in count"
      :key="i"
    />
    <div>
      <Child
        v-for="i in count"
        :key="i"
      />
    </div>
  </div>
</template>
