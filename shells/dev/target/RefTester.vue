<template>
  <div id="tester">
    <p ref="tester" id="testing" class="test test1">{{ count }}</p>
  </div>
</template>

<script>
export default {
  computed: {
    count() { return 1 },
  }
}
</script>
