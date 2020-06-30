<script>
import Nested from './Nested.vue'

export default {
  components: {
    Nested
  }
}
</script>

<template>
  <Nested />
  <Nested key="foobar" />
</template>
