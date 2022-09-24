<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    noPlugins: {
      type: Boolean,
      default: false,
    },
  },
})
</script>

<template>
  <div class="h-full flex flex-col items-center justify-center p-8 space-y-8">
    <div
      v-if="noPlugins"
      class="bg-gray-50 dark:bg-gray-900 text-gray-500 px-3 py-1 rounded text-sm"
    >
      No plugins found
    </div>

    <div class="flex items-center space-x-8 max-w-lg">
      <img
        src="~@front/assets/undraw_Gift_box.svg"
        class="max-h-32 flex-none"
      >

      <p class="flex-1">
        Devtools plugins are added by packages in your application. They can provide new features to the Vue devtools, such as custom inspectors, additional component data or timeline layers.
      </p>
    </div>

    <VueButton
      href="https://devtools.vuejs.org/plugin/plugins-guide.html"
      target="_blank"
      class="primary"
    >
      Create your own Plugin
    </VueButton>
  </div>
</template>
