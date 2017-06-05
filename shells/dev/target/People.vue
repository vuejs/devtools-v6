<template>
  <div class="people">
    <h1>People</h1>
    <p>This demonstrates how having an individual Component Name can be beneficial for lists.</p>
    <person first-name="Evan" last-name="You" />
    <person first-name="Gambo" />
  </div>
</template>

<script>
import Person from './Person.vue'

export default {
  name: 'People',
  components: { Person },
  computed: {
    instanceName () {
      return 'Open Me'
    }
  }
}
</script>
