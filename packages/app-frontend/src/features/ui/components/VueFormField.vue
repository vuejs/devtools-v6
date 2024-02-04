<script lang="ts">
import { computed, defineComponent, provide, reactive } from 'vue'

const statusIcons = {
  danger: 'error',
  warning: 'warning',
  info: 'info',
  success: 'check_circle',
} as const

export default defineComponent({
  props: {
    subtitle: {
      type: String,
      default: undefined,
    },
    subtitleIcon: {
      type: String,
      default: undefined,
    },
    statusIcon: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: undefined,
    },
  },

  setup(props) {
    const injectedData = reactive({
      focused: false,
      status: null,
    })

    provide('VueFormField', {
      data: injectedData,
    })

    const subtitleIconId = computed(() => {
      if (props.subtitleIcon) {
        return props.subtitleIcon
      }

      if (props.statusIcon) {
        const status = injectedData.status
        if (status) {
          return statusIcons[status]
        }
      }

      return ''
    })

    return {
      injectedData,
      subtitleIconId,
    }
  },
})
</script>

<template>
  <div
    class="vue-ui-form-field"
    :class="{
      focused: injectedData.focused,
      [`status-${injectedData.status}`]: injectedData.status,
    }"
  >
    <div class="wrapper">
      <div class="title">
        <slot name="title">
          <span v-html="title" />
        </slot>
      </div>
      <div class="content">
        <slot />
      </div>
      <div
        class="subtitle"
        :class="{
          [`vue-ui-text ${injectedData.status}`]: injectedData.status,
        }"
      >
        <VueIcon v-if="subtitleIconId" :icon="subtitleIconId" />
        <slot name="subtitle">
          <span v-html="subtitle" />
        </slot>
      </div>
    </div>
  </div>
</template>
