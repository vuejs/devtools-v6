<template>
  <div class="two-way box">
    <h2>Two Way</h2>
    <p>Component for testing two way data binding.</p>
    <div class="actions">
      <input class="msg-input" v-model="localMsg">
      <p>Local Message: <b>{{localMsg}}</b></p>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      localMsg: 'Hello World',
    }
  }
}
</script>

<style lang="stylus">
  @import "../common"
  .msg-input
    width: 100%
    margin: 1em 0em
    padding: 0.5em
    border: 1px solid $green
    color: $grey
</style>
