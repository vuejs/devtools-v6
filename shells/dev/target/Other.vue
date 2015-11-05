<template>
  <div>
    Other
    <mine></mine>
  </div>
</template>

<script>
export default {
  data () {
    let a = { c: function () {} }
    a.a = a
    let b = []
    b[0] = b
    return {
      a: a,
      b: b
    }
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
