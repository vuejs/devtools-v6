<template>
  <div
    id="app"
    class="app-connecting"
    :class="`theme-${theme}`"
  >
    <div class="animation-outer">
      <div class="animation-inner">
        <img
          src="~@front/assets/vue-logo.svg"
          alt="Vue logo"
          class="logo"
        >
      </div>
    </div>
  </div>
</template>

<script>
import { isChrome } from '@utils/env'

export default {
  data () {
    return {
      theme: isChrome ? chrome.devtools.panels.themeName : 'light'
    }
  }
}
</script>

<style lang="stylus" scoped>
.app-connecting
  width 100%
  height 100%
  display flex
  align-items center
  justify-content center

  &.theme-dark
    background $vue-ui-color-almost-black

.animation-inner
  padding 28px 24px 16px
  background rgba($vue-ui-color-primary, .1)
  animation animation 1s .1s backwards cubic-bezier(0, 1, .2, 1)

.animation-outer
  padding 24px
  background rgba($vue-ui-color-primary, .1)
  animation animation 1s cubic-bezier(0, 1, .2, 1)

.animation-inner,
.animation-outer
  border-radius 50%

.logo
  max-width 64px

@keyframes animation {
  0% {
    opacity 0
    transform scale(.7)
  }
  100% {
    opacity 1
    transform none
  }
}
</style>
