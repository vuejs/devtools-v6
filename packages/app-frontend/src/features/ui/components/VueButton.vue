<script lang="ts">
import type { PropType } from 'vue'
import { computed, defineComponent, useAttrs } from 'vue'
import { useDisabledChild } from '../composables/useDisabled'

export default defineComponent({
  props: {
    iconLeft: {
      type: String,
      default: '',
    },
    iconRight: {
      type: String,
      default: '',
    },
    label: {
      type: String,
      default: '',
    },
    loading: Boolean,
    loadingSecondary: Boolean,
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button',
    },
    tag: {
      type: [String, Number],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['click'],
  setup(props, { emit }) {
    const attrs = useAttrs()
    const { finalDisabled } = useDisabledChild(props)
    const component = computed(() => {
      if (attrs.to) {
        return 'router-link'
      }
      else if (attrs.href) {
        return 'a'
      }
      else {
        return 'button'
      }
    })
    const ghost = computed(() => {
      return finalDisabled.value || props.loading || props.loadingSecondary
    })
    const handleClick = (event: MouseEvent) => {
      if (ghost.value) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
      }
      else {
        emit('click', event)
      }
    }
    return {
      attrs,
      component,
      ghost,
      handleClick,
    }
  },
})
</script>

<template>
  <component
    :is="component"
    class="vue-ui-button"
    :class="[
      component,
      {
        loading,
        ghost,
      },
    ]"
    :type="type"
    :tabindex="ghost ? -1 : 0"
    role="button"
    :aria-disabled="ghost ? true : null"
    @click.capture="handleClick"
  >
    <VueLoadingIndicator v-if="loading" />

    <span class="content">
      <VueLoadingIndicator
        v-if="loadingSecondary"
        class="inline small loading-secondary"
      />
      <VueIcon
        v-else-if="iconLeft"
        :icon="iconLeft"
        class="button-icon left"
      />

      <span class="default-slot">
        <slot>
          {{ label }}
        </slot>
      </span>

      <div
        v-if="tag != null"
        class="tag-wrapper"
      >
        <div class="tag">{{ tag }}</div>
      </div>

      <VueIcon
        v-if="iconRight"
        :icon="iconRight"
        class="button-icon right"
      />
    </span>
  </component>
</template>
