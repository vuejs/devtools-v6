<script lang="ts">
import type {
  UnwrapNestedRefs,
} from 'vue'
import {
  computed,
  defineComponent,
  inject,
  reactive,
  ref,
  watch,
} from 'vue'

export default defineComponent({
  inheritAttrs: false,
  props: {
    iconLeft: {
      type: String,
      default: null,
    },
    iconRight: {
      type: String,
      default: null,
    },
    loadingLeft: {
      type: Boolean,
      default: false,
    },
    loadingRight: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default: undefined,
    },
    selectAll: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: undefined,
    },
    suggestion: {
      type: [String, Number],
      default: null,
    },
    type: {
      type: String,
      default: 'text',
    },
    modelValue: {
      type: [String, Number],
      required: true,
    },
  },
  emits: ['blur', 'focus', 'update:modelValue'],

  setup(props, { emit }) {
    const vueFormField = inject<{
      data: UnwrapNestedRefs<{
        focused: boolean
        status: string | null
      }>
    }>('VueFormField', null)

    const model = computed({
      get: () => props.modelValue,
      set: (value: string | number) => {
        emit('update:modelValue', value)
      },
    })
    const input = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
    const focused = ref(false)
    const select = reactive({
      autoSelect: false,
      selectAllTimer: null,
    })

    const showSuggestion = computed(
      () =>
        props.suggestion !== null
        && props.suggestion !== model.value
        && focused.value
        && model.value,
    )

    watch(
      () => focused.value,
      (value) => {
        if (vueFormField) {
          vueFormField.data.focused = value
        }
      },
      {
        immediate: true,
      },
    )

    watch(
      () => props.status,
      (value) => {
        if (vueFormField) {
          vueFormField.data.status = value
        }
      },
      {
        immediate: true,
      },
    )

    const focus = () => {
      input.value?.focus()
    }

    const autoSelectAll = () => {
      if (props.selectAll && select.autoSelect) {
        const inputElement = input.value
        requestAnimationFrame(() => {
          inputElement.setSelectionRange(0, inputElement.value.length)
          clearTimeout(select.selectAllTimer)
          select.selectAllTimer = setTimeout(() => {
            select.autoSelect = false
          }, 500)
        })
      }
    }

    const onBlur = (event: FocusEvent) => {
      focused.value = false
      select.autoSelect = false
      emit('blur', event)
    }

    const onFocus = (event: FocusEvent) => {
      if (!focused.value) {
        clearTimeout(select.selectAllTimer)
        select.autoSelect = true
      }
      focused.value = true
      autoSelectAll()
      emit('focus', event)
    }

    const onKeyTab = (event: KeyboardEvent) => {
      if (showSuggestion.value) {
        model.value = props.suggestion
        event.preventDefault()
        event.stopPropagation()
      }
    }

    return {
      input,
      focused,
      showSuggestion,
      model,
      focus,
      onBlur,
      onFocus,
      onKeyTab,
    }
  },
})
</script>

<template>
  <div
    class="vue-ui-input"
    :class="[
      `type-${type}`,
      {
        focused,
        'show-suggestion': showSuggestion,
        [`status-${status}`]: status,
      },
      $attrs.class,
    ]"
    @click="focus()"
  >
    <div class="content">
      <VueLoadingIndicator
        v-if="loadingLeft"
        class="small left"
      />

      <VueIcon
        v-else-if="iconLeft"
        :icon="iconLeft"
        class="input-icon left"
      />

      <slot name="left" />

      <div class="input-wrapper">
        <component
          :is="type === 'textarea' ? type : 'input'"
          ref="input"
          class="input"
          :type="type"
          :value.prop="modelValue"
          :placeholder="placeholder"
          v-bind="$attrs"
          @input="model = $event.currentTarget.value"
          @focus="onFocus"
          @blur="onBlur"
          @keydown.tab="onKeyTab"
        />

        <input
          v-if="showSuggestion"
          class="input suggestion"
          :value="suggestion"
          disabled
        >
      </div>

      <slot name="right" />

      <VueIcon
        v-if="iconRight"
        :icon="iconRight"
        class="input-icon right"
      />

      <VueLoadingIndicator
        v-if="loadingRight"
        class="small right"
      />

      <!-- Focus animation -->
      <div class="border" />
    </div>
  </div>
</template>

<style lang="stylus">
@import '~@vue/ui/src/style/imports'

colors($color)
  > .content
    > .border
      background $color
  &.focused
    > .content
      > .vue-ui-loading-indicator
        .animation
          border-right-color $color
          border-bottom-color $color
      > .input-icon
        svg
          fill rgba($color, .8)

.vue-ui-input
  $lightened = theme('colors.gray.500')
  display inline-block
  vertical-align middle
  box-sizing border-box
  width auto
  min-width 200px

  > .content
    h-box()
    box-center()
    padding 0 10px
    border solid 1px $vue-ui-primary-100
    color $vue-ui-gray-800
    border-radius $br
    transition background .3s
    position relative
    .vue-ui-dark-mode &
      border-color theme('colors.gray.700')
      color $vue-ui-white

    > .input-wrapper
      position relative
      width 0
      flex auto 1 1

      > .input
        position relative
        z-index 1
        font-family inherit
        font-size 14px
        line-height 14px
        color @color
        padding 0
        width 100%
        display block
        border none
        background transparent
        .vue-ui-dark-mode &
          color $vue-ui-white
        &:not(textarea)
          height 30px
        &::placeholder
          color $lightened
          .vue-ui-dark-mode &
            color $vue-ui-gray-300
        // Disable noisy browser styles
        outline none
        &::-moz-focus-inner
          border 0

      > textarea.input
        padding 8px 10px
        resize vertical
        min-height 30px
        box-sizing border-box
        line-height 18px

      > .suggestion
        position absolute
        z-index 0
        top 0
        left 0
        overflow hidden
        white-space nowrap
        text-overflow ellipsis
        color $lightened
        pointer-events none

    > .input-icon
      &.left
        margin-right 6px
      &.right
        margin-left 6px
      svg
        fill $lightened
        transition fill .3s

    > .vue-ui-loading-indicator
      &.left
        margin-right 8px
      &.right
        margin-left 8px
      .animation
        border-right-color $lightened
        border-bottom-color $lightened

    > .border
      position absolute
      bottom -1px
      left 30%
      right @left
      opacity 0
      height 2px
      pointer-events none
      transition left .15s, right .15s, opacity .15s

  &.type-textarea
    > .content
      padding 0

  &:not(.flat)
    > .content
      background $vue-ui-white
      .vue-ui-dark-mode &
        background $vue-ui-gray-900

  &.show-suggestion
    > .content > .input-wrapper > .input
      &::placeholder
        color transparent

  // Colors
  colors($vue-ui-primary-500)
  &.accent
    colors($vue-ui-accent-500)
    .vue-ui-dark-mode &
      colors($vue-ui-accent-300)
  &.danger,
  &.status-danger
    colors($vue-ui-danger-500)
  &.warning,
  &.status-warning
    colors($vue-ui-warning-500)
  &.info,
  &.status-info
    colors($vue-ui-info-500)
  &.success,
  &.status-success
    colors($vue-ui-primary-500)

  &.focused
    &:not(.flat)
      > .content
        > .border
          left 0
          right @left
          opacity 1
      &.round
        > .content > .border
          display none

  &.flat
    > .content
      border-color transparent
      > .border
        display none

  &.big
    > .content
      padding 0 14px
      > .input-wrapper
        > .input
          font-size 16px
          &:not(textarea)
            height 42px
        > textarea.input
          padding 14px 0

      > .input-icon
        width 20px
        height @width
        &.left
          margin-right 10px
        &.right
          margin-left 10px

  &.round
    > .content
      border-radius 17px
    // Big button
    &.big
      > .content
        border-radius 22px

  &:not(.disabled)
    cursor text

  &.disabled
    opacity .5

  .vue-ui-dropdown-content > &
    min-width 200px
    padding 0 4px 4px

  .vue-ui-high-contrast &
    > .content
      border-width 2px
      border-style dashed
      background $md-black !important
</style>
