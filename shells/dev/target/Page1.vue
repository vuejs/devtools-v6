<template>
  <div id="page-1">
    <h2>Page 1</h2>
    <p>{{ provided }}</p>
  </div>
</template>

<script>
export default {
  inject: ['provided']
}
</script>

