<template>
  <div>
    Other
    <mine></mine>
  </div>
</template>

<script>
export default {
  data () {
    var a = {}
    a.a = a
    return a
  },
  components: {
    mine: {
      template: 'This is a fragment instance',
      data () {
        return {
          // testing all data types
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
