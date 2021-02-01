<script>
export default {
  components: {
    InIf: {
      name: 'InIf',
      mounted () {
        this.$emit('hi')
      },
      template: '<div>Inside v-if</div>'
    }
  },

  data () {
    return {
      show1: false,
      show2: true
    }
  }
}
</script>

<template>
  <div>
    <button @click="show1 = !show1">
      Toggle 1
    </button>
    <InIf
      v-if="show1"
      key="1"
    />
    <button @click="show2 = !show2">
      Toggle 2
    </button>
    <InIf
      v-if="show2"
      key="2"
    />
  </div>
</template>
