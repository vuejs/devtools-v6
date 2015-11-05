<template>
  <div>
    Other
    <mine></mine>
  </div>
</template>

<script>
export default {
  components: {
    mine: {
      template: 'This is a fragment instance',
      data () {
        return {
          // bad dude
          a: function () {},
          b: /123/,
          c: document.createElement('div'),
          d: null,
          e: undefined,
          f: true,
          g: 12345
        }
      }
    }
  }
}
</script>
