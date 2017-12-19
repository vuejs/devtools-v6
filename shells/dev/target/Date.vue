<template>
  <div id="date">
    <p>Date: {{ date.toString() }} - Hours: {{ hours }} - Prototype: {{ date | prototypeString }}</p>

    <p>
      <button @click="updateDate">Update Date</button>
    </p>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  data () {
    return {
      localDate: new Date()
    }
  },
  computed: {
    ...mapState(['date']),
    ...mapGetters(['hours'])
  },
  methods: {
    ...mapMutations({
      updateDate: 'UPDATE_DATE'
    })
  },
  filters: {
    prototypeString: val => Object.prototype.toString.call(val)
  }
}
</script>
