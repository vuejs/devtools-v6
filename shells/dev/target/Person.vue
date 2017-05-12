<template>
  <div class="person">
    Person: {{ fullName }}
  </div>
</template>

<script>

export default {
  name: 'Person',
  props: ['firstName', 'lastName'],
  computed: {
    fullName () {
      return [this.firstName, this.lastName]
               .filter(item => item !== undefined)
               .join(' ')
    },
    instanceName () {
      return this.fullName
    }
  }
}
</script>
