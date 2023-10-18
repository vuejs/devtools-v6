<template>
  <PropagateDisable :disabled="propagateDisabled">
    <slot />
  </PropagateDisable>
</template>

<script>
import { computed, defineComponent, h } from 'vue'
import { useDisabledChild, useDisabledParent } from '../composables/useDisabled'

export default defineComponent({
  name: 'VueDisable',
  props: {
    stopPropagation: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    PropagateDisable: {
      props: {
        disabled: {
          type: Boolean,
          default: false,
        },
      },
      setup (props, { slots }) {
        useDisabledParent(props)
        return () => h('div', { class: 'vue-ui-disable' }, slots)
      },
    },
  },
  setup (props) {
    const { finalDisabled } = useDisabledChild(props)
    const propagateDisabled = computed(() => {
      return props.stopPropagation ? props.disabled : finalDisabled.value
    })

    return {
      propagateDisabled,
    }
  },
})
</script>
