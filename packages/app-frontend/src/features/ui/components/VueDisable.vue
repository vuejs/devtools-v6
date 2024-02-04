<script>
import { computed, defineComponent, h } from 'vue'
import { useDisabledChild, useDisabledParent } from '../composables/useDisabled'

export default defineComponent({
  name: 'VueDisable',
  components: {
    PropagateDisable: {
      props: {
        disabled: {
          type: Boolean,
          default: false,
        },
      },
      setup(props, { slots }) {
        useDisabledParent(props)
        return () => h('div', { class: 'vue-ui-disable' }, slots)
      },
    },
  },
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
  setup(props) {
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

<template>
  <PropagateDisable :disabled="propagateDisabled">
    <slot />
  </PropagateDisable>
</template>
