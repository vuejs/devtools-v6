<template lang="html">
  <div
    class="group-dropdown"
    :tabindex="isOpen ? -1 : 0"
    :class="{
      'selected': isValueInOptions
    }"
    @mouseenter="$emit('update', true)"
    @mouseleave="$emit('update', false)"
    @focus="$emit('update', true)"
    @click.self="selectDefault"
  >
    <slot name="header" />
    <div
      v-show="isOpen"
      class="group-dropdown-options"
    >
      <template v-for="option of options">
        <slot
          :ref="option.name"
          name="option"
          :option="option"
        />
      </template>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    isOpen: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array,
      required: true
    },
    value: {
      type: String,
      required: true
    }
  },
  computed: {
    isValueInOptions () {
      return this.options.find(
        option => option.name === this.value
      )
    }
  },
  watch: {
    isOpen (isOpen) {
      if (isOpen) {
        window.addEventListener('click', this.outsideClickHandler)
      } else {
        window.removeEventListener('click', this.outsideClickHandler)
      }
    }
  },
  methods: {
    outsideClickHandler ($event) {
      if (!this.$el.contains($event.target)) {
        this.$emit('update', false)
      }
    },
    selectDefault () {
      this.$emit('select', this.options[0].name)
      this.$el.blur()
    }
  }
}
</script>

<style lang="stylus" scoped>
.group-dropdown
  display: flex
  align-items: center
  padding: 0 14px
  position: relative
  z-index: 100
  height: 48px
  &:focus
    outline: none
    background: #f6f6f6
  & /deep/ svg
    fill: #2c3e50

.group-dropdown-options
  position: absolute
  background: white
  left: 0
  top: 48px
  width: 100%
  box-shadow: 0 3px 6px rgba(0,0,0,0.15)
  border-bottom-left-radius: 3px
  border-bottom-right-radius: 3px
</style>
