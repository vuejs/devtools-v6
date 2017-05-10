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
          h: 'I am a really long string mostly just to see how the horizontal scrolling works.'
        }
      }
    }
  }
}
</script>
