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
      show: true
    }
  }
}
</script>

<template>
  <div>
    <button @click="show = !show">
      Toggle
    </button>
    <InIf v-if="show" />
  </div>
</template>
