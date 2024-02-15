<script lang="ts">
/* eslint-disable vue/no-unused-refs */

import { defineComponent, nextTick, onMounted, ref } from 'vue'
import { useDisableScroll } from '../composables/useDisableScroll'

export default defineComponent({
  name: 'VueModal',

  props: {
    locked: {
      type: Boolean,
      default: false,
    },

    title: {
      type: String,
      default: null,
    },
  },

  emits: ['close'],

  setup(props, { emit }) {
    const rootElement = ref<HTMLElement | null>(null)
    onMounted(async () => {
      await nextTick()
      rootElement.value?.focus()
    })

    useDisableScroll()

    const close = () => {
      if (!props.locked) {
        emit('close')
      }
    }

    return {
      close,
    }
  },
})
</script>

<template>
  <transition
    ref="rootElement"
    name="vue-ui-modal"
    :duration="{
      enter: 1000,
      leave: 300,
    }"
    appear
  >
    <div
      class="vue-ui-modal"
      :class="{
        locked,
      }"
      tabindex="0"
      role="dialog"
      aria-modal="true"
      @keyup.esc="close()"
    >
      <div
        class="backdrop"
        @click="close()"
      />

      <div
        class="shell"
        @keyup.esc="close()"
      >
        <div class="header">
          <slot name="header">
            <div
              v-if="title"
              class="title"
              v-html="title"
            />
          </slot>
        </div>
        <div class="body">
          <slot />
        </div>
        <div class="footer">
          <slot name="footer" />
        </div>

        <VueButton
          v-if="!locked"
          class="close-button icon-button flat round"
          icon-left="close"
          @click="close()"
        />
      </div>
    </div>
  </transition>
</template>
