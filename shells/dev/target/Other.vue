<template>
  <div>
    Other {{ id }}
    <mine></mine>
  </div>
</template>

<script>
// this computed property should be visible
// even if component has no 'computed' defined
const computedPropMixin = {
  computed: {
    computedPropFromMixin() {
      return null
    }
  }
}

export default {
  props: ['id'],
  mixins: [ computedPropMixin ],
  data () {
    let a = { c: function () {} }
    a.intentionalRecursion = a
    let b = []
    b[0] = b
    return {
      a: a,
      intentionalRecusionArray: b
    }
  },
  components: {
    mine: {
      render: h => h('div', null, 'mine'),
      data () {
        return {
          // testing all data types
          a: function () {},
          b: /123/,
          c: document.createElement('div'),
          d: null,
          e: undefined,
          f: true,
          g: 12345,
          h: 'I am a really long string mostly just to see how the horizontal scrolling works.',
          i: new Set([1, 2, 3, 4, new Set([5, 6, 7, 8])]),
          j: new Map([[1, 2], [3, 4], [5, new Map([[6, 7,]])]])
        }
      }
    }
  }
}
</script>
