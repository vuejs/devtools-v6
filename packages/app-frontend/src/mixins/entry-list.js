import debounce from 'lodash/debounce'

export default function ({
  indexOffset = 0
} = {}) {
  // @vue/component
  return {
    watch: {
      inspectedIndex: 'refreshScrollToInspected'
    },

    mounted () {
      this.refreshScrollToInspected()
    },

    activated () {
      this.refreshScrollToInspected()
    },

    methods: {
      refreshScrollToInspected () {
        if (this.inspectedIndex) this.scrollIntoInspected(this.inspectedIndex)
      },

      scrollIntoInspected: debounce(async function (index) {
        index += indexOffset
        // Wait for defer frames (time-slicing)
        for (let f = 0; f < 2; f++) {
          await waitForFrame()
        }
        const scroller = this.$globalRefs.leftRecycleList || this.$globalRefs.leftScroll
        if (!scroller) {
          this.scrollIntoInspected(index)
          return
        }
        const parentHeight = scroller.offsetHeight
        const height = this.highDensity ? 22 : 34
        const top = index * height
        const scrollTop = scroller.scrollTop
        if (top < scrollTop) {
          scroller.scrollTop = top
        } else if (top + height > scrollTop + parentHeight) {
          scroller.scrollTop = top + height - parentHeight
        }
      }, 200, {
        leading: true
      })
    }
  }
}

function waitForFrame () {
  return new Promise(resolve => {
    requestAnimationFrame(resolve)
  })
}
