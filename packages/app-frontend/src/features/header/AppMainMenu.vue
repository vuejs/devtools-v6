<script>
import { onMounted } from '@vue/composition-api'

export default {
  setup () {
    onMounted(() => {
      // eslint-disable-next-line no-undef
      Headway.init({
        selector: '.changelog-button',
        account: '7kY9Zy'
      })
    })
  }
}
</script>

<template>
  <div class="relative">
    <VueDropdown
      offset="0"
    >
      <template #trigger>
        <VueButton
          class="flat logo-button"
        >
          <img
            src="~@front/assets/vue-logo.svg"
            alt="Vue logo"
            class="w-10 h-10"
          >
        </VueButton>
      </template>

      <VueDropdownButton
        :to="{
          name: 'global-settings'
        }"
      >
        Settings
      </VueDropdownButton>

      <VueDropdownButton
        href="https://new-issue.vuejs.org/?repo=vuejs/vue-devtools"
        target="_blank"
      >
        Report a bug
      </VueDropdownButton>

      <VueDropdownButton
        href="https://github.com/vuejs/vue-devtools/releases"
        target="_blank"
      >
        Full changelog
      </VueDropdownButton>
    </VueDropdown>

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
