<script lang="ts">
import { onMounted, defineComponent } from '@vue/composition-api'

export default defineComponent({
  setup () {
    onMounted(() => {
      if (typeof Headway !== 'undefined') {
        // eslint-disable-next-line no-undef
        Headway.init({
          selector: '.changelog-button',
          account: '7kY9Zy'
        })
      }
    })
  }
})
</script>

<template>
  <div class="relative">
    <VueButton
      href="https://headwayapp.co/vue-js-devtools-changelog"
      target="_blank"
      class="flat logo-button"
    >
      <img
        src="~@front/assets/vue-logo.svg"
        alt="Vue logo"
        class="w-8 h-8"
      >
    </VueButton>

    <div class="changelog-button" />
  </div>
</template>

<style lang="postcss" scoped>
.logo-button {
  padding: 0;
  width: 32px !important;
}

.changelog-button {
  @apply absolute;
  bottom: 0px;
  right: -2px;

  >>> .HW_badge_cont {
    width: 16px;
    height: 16px;
  }

  >>> .HW_badge {
    top: 0px;
    left: 0px;
  }
}
</style>
