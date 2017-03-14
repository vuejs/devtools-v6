<template>
  <div class="hero">
    <div class="left">
      <img src="../../assets/logo.png">
    </div>
    <div class="right">
      <h1>Welcome to the Vue.js Dev-Tools</h1>
      <p>
        <a class="button" href="https://github.com/vuejs/vue-devtools" target="_blank">GITHUB</a>
      </p>
    </div>
  </div>
</template>

<script>
export default {}
</script>

<style lang="stylus">
  @import "../common"
  
  .hero
    margin-bottom: 40px
    .left, .right
      display: inline-block
      vertical-align: top
    .left
      width: 29%
    .right
      width: 71%
      text-align: center;
    .button
      color: $white;
      background-color: $green;
      text-decoration: none
      margin: 1em 0
      font-size: 1.05em
      font-weight: 600
      letter-spacing: 0.1em
      padding: 0.5em 1.5em
      border-radius: 2em
      display: inline-block
      transition: all 0.15s ease
      box-sizing: border-box
      border: 1px solid $green
    .button.white
      background-color: $white
      color: $green
</style>
