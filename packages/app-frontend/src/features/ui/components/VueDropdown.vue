<script lang="ts">
import {
  computed,
  defineComponent,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from 'vue'
import { useDisabledChild } from '../composables/useDisabled'

export default defineComponent({
  name: 'VueDropdown',
  props: {
    autoHide: {
      type: Boolean,
      default: true,
    },

    buttonClass: {
      type: [String, Array, Object],
      default: null,
    },

    contentClass: {
      type: [String, Array, Object],
      default: null,
    },

    forceMinSize: {
      type: Boolean,
      default: false,
    },

    iconLeft: {
      type: String,
      default: null,
    },

    iconRight: {
      type: String,
      default: null,
    },

    label: {
      type: [String, Number],
      default: null,
    },

    offset: {
      type: Array,
      default: () => [0, 4],
    },

    noPopoverFocus: {
      type: Boolean,
      default: false,
    },

    disabled: {
      type: Boolean,
      default: false,
    },

    modelValue: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['update:modelValue', 'popoverMousedown', 'popoverMouseup'],

  setup(props, { emit }) {
    const width = ref(0)
    const popoverContent = ref<HTMLElement | null>(null)
    const popover = ref<HTMLElement | null>(null)
    const { finalDisabled } = useDisabledChild(props)

    const isOpen = ref(props.modelValue)

    const model = computed({
      get: () => isOpen.value,
      set: (value) => {
        isOpen.value = value
        emit('update:modelValue', value)
      },
    })

    watch(() => props.modelValue, () => {
      if (props.modelValue !== model.value) {
        model.value = props.modelValue
      }
    })

    onMounted(async () => {
      if (props.forceMinSize) {
        await nextTick()
        onResize()
      }
    })

    onBeforeUnmount(() => {
      removeGlobalMouseEvents()
    })

    function onKeyTab(event: KeyboardEvent) {
      // Focus the first focusable element in the popover instead of cycling through the whole app
      // (popover content will be append at the end of the body)
      if (model.value && !props.noPopoverFocus) {
        const el = popoverContent.value.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]',
        )
        if (el) {
          event.preventDefault()
          el.focus()
        }
      }
    }

    function onPopoverContentMousedown(event: MouseEvent) {
      emit('popoverMousedown', event)
      window.addEventListener('mouseup', onPopoverContentMouseup)
    }

    function onPopoverContentMouseup(event: MouseEvent) {
      emit('popoverMouseup', event)
      removeGlobalMouseEvents()
    }

    function onResize() {
      width.value = popover.value.offsetWidth
    }

    function onUpdateShown(value: boolean) {
      model.value = value
    }

    function removeGlobalMouseEvents() {
      window.removeEventListener('mouseup', onPopoverContentMouseup)
    }

    return {
      model,
      width,
      popoverContent,
      popover,
      onKeyTab,
      onResize,
      onPopoverContentMousedown,
      onUpdateShown,
      finalDisabled,
    }
  },
})
</script>

<template>
  <VDropdown
    ref="popover"
    class="vue-ui-dropdown"
    :auto-hide="autoHide"
    :distance="offset[1]"
    :skidding="offset[0]"
    :disabled="finalDisabled"
    :shown="model"
    @update:shown="onUpdateShown"
    @keydown.tab="onKeyTab"
  >
    <div class="dropdown-trigger">
      <slot name="trigger">
        <VueButton
          :class="buttonClass"
          :icon-left="iconLeft"
          :icon-right="iconRight"
          :disabled="finalDisabled"
        >
          {{ label }}
        </VueButton>
      </slot>
    </div>

    <template #popper>
      <VueDisable
        ref="popoverContent"
        class="vue-ui-dropdown-content"
        :class="contentClass"
        :style="{
          minWidth: forceMinSize ? `${width}px` : '0',
        }"
        :disabled="!model"
        @mousedown="onPopoverContentMousedown"
      >
        <slot />
      </VueDisable>
    </template>

    <resize-observer
      v-if="forceMinSize"
      @notify="onResize"
    />
  </VDropdown>
</template>
