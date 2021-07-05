<template>
  <p class="sponsor-button">
    <github-button
      href="https://github.com/sponsors/Akryum"
      data-icon="octicon-heart"
      data-size="large"
      aria-label="Sponsor @Akryum on GitHub"
    >
      Sponsor on GitHub
    </github-button>
  </p>
</template>

<script>
import GithubButton from 'vue-github-button'

export default {
  components: {
    GithubButton
  }
}
</script>

<style lang="stylus" scoped>
.sponsor-button
  text-align center
  margin 24px 0
</style>
