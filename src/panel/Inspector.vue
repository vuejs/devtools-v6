<template>
  <div>
    <h2>Inspector</h2>
    <p>{{ target.name }}</p>
    <pre>{{ target.state | json }}</pre>
    <pre>{{ target.props | json }}</pre>
    <pre>{{ target.computed | json }}</pre>
  </div>
</template>

<script>
export default {
  props: {
    target: Object
  }
}
</script>
