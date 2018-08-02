import debounce from 'lodash.debounce'

export default function ({
  indexOffset = 0
} = {}) {
  // @vue/component
  return {
    watch: {
      inspectedIndex (value) {
        this.scrollIntoInspected(value)
      }
    },

    mounted () {
      requestAnimationFrame(() => {
        if (this.inspectedIndex) this.scrollIntoInspected(this.inspectedIndex)
      })
    },

    methods: {
      scrollIntoInspected: debounce(function (index) {
        index += indexOffset
        this.$nextTick(() => {
          const scroller = this.$globalRefs.leftRecycleList || this.$globalRefs.leftScroll
          const parentHeight = scroller.offsetHeight
          const height = this.highDensity ? 22 : 34
          const top = index * height
          const scrollTop = scroller.scrollTop
          if (top < scrollTop) {
            scroller.scrollTop = top
          } else if (top + height > scrollTop + parentHeight) {
            scroller.scrollTop = top + height - parentHeight
          }
        })
      }, 30)
    }
  }
}
