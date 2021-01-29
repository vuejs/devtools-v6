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
  },

  data () {
    return {
      childRefs: []
    }
  },

  beforeUpdate () {
    this.childRefs = []
  }
}
</script>

<template>
  <div>
    <h3 ref="title">
      Nest children
    </h3>
    <Child
      v-for="i in count"
      :key="i"
      :ref="target => target && childRefs.push(target)"
    />
    <div>
      <Child
        v-for="i in count"
        :key="i"
        :my-attr="i"
      />
    </div>
  </div>
</template>
