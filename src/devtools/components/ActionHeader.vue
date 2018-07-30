<template>
  <div class="action-header">
    <slot />
  </div>
</template>

<style lang="stylus" scoped>
@import "../variables"

.action-header
  display flex
  align-items stretch
  padding 0 10px
  font-size 12px
  border-bottom 1px solid $border-color
  color #666
  height 35px
  @media (min-height: $tall)
    height 50px
  .vue-ui-dark-mode &
    border-bottom 1px solid $dark-border-color

.title
  display flex
  align-items center
  font-size 18px
  color $component-color

  + .search
    margin-left 10px

  &-bracket
    color #ccc

.vue-ui-icon
  width 16px
  height @width
  margin-right 0
  @media (min-width: $wide)
    margin-right 5px

.button
  cursor pointer
  display flex
  align-items center
  justify-content center
  padding 0 10px
  transition opacity .25s, color .25s
  white-space nowrap
  opacity .8
  overflow hidden

  .vue-ui-icon >>> svg
    transition fill .25s

  &:first-of-type
    margin-left auto

  &:not(.disabled):hover,
  &:not(.disabled).active
    opacity 1
    color $active-color

    .vue-ui-icon >>> svg
      fill @color

  &.disabled
    opacity 0.45
    cursor not-allowed

  span
    display none
    @media (min-width: $wide)
      display inline

.search
  display flex
  align-items center
  flex 1
  input
    flex 1
    height 100%
    background-color transparent
    border 0
    margin-left 5px
    font-size inherit
    color inherit
    outline 0
    transition color 0.25s
    &:focus
      color $active-color

    &::placeholder
      opacity 0.8

    &.invalid
      color rgba(77, 10, 9, 1)
</style>
