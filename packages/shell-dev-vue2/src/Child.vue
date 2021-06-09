<script>
export default {
  data () {
    return {
      count: 0
    }
  }
}
</script>

<template>
  <div>
    {{ count }} <button @click="count++">
      +1
    </button>
  </div>
</template>
