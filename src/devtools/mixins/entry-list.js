import { scrollIntoView } from 'src/util'

export default {
  watch: {
    inspectedIndex (value) {
      this.$nextTick(() => {
        const el = value === -1 ? this.$refs.baseEntry : this.$refs.entries[value]
        el && scrollIntoView(this.$globalRefs.leftScroll, el, false)
      })
    }
  }
}
