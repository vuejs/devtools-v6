/**
 * (Use with the DisabledChild mixin)
 * Allow disabling an entire tree of components implementing the DisabledChild mixin.
 */

import { computed, inject, provide, reactive, watch } from 'vue'

export function useDisabledParent(props: { disabled?: boolean }) {
  const injectedDisableData = reactive({
    value: props.disabled || false,
  })

  provide('VueDisableMixin', {
    data: injectedDisableData,
  })

  watch(
    () => props.disabled,
    (value, oldValue) => {
      if (value !== oldValue) {
        injectedDisableData.value = value
      }
    },
  )
}

export function useDisabledChild(props: { disabled?: boolean }) {
  const injectDisable = inject<{ data: { value: boolean } } | undefined>(
    'VueDisableMixin',
    null,
  )

  return {
    finalDisabled: computed(() => props.disabled || (injectDisable && injectDisable.data.value)),
  }
}
