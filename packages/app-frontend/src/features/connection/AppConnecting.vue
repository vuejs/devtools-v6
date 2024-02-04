<template>
  <div class="app-connecting w-full h-full flex items-center justify-center bg-white dark:bg-gray-800">
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

<style lang="stylus" scoped>
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
  max-width 72px

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
