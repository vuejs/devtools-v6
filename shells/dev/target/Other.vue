<template>
  <div>
    Other {{ id }}
    <mine/>
  </div>
</template>

<script>
// this computed property should be visible
// even if component has no 'computed' defined
const computedPropMixin = {
  computed: {
    computedPropFromMixin () {
      return null
    }
  }
}

export default {
  name: 'other-with-mine',
  inheritAttrs: false,
  mixins: [computedPropMixin],
  provide: {
    foo: 'bar',
    noop: (a, b, c) => {},
    answer: 42
  },
  props: ['id'],
  data () {
    const a = { c: function () {} }
    a.a = a
    const b = []
    b[0] = b
    return {
      a: a,
      b: b
    }
  },
  components: {
    mine: {
      inject: ['foo', 'noop', 'answer'],
      render: h => h('div', { class: 'mine' }, 'mine'),
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

<style lang="stylus">
.mine
  display inline-block
</style>
