<script lang="ts">
import { defineComponent, computed } from 'vue'
import { useVueVersionCheck } from './vue-version-check'

export default defineComponent({
  props: {
    app: {
      type: Object,
      required: true,
    },

    selected: {
      type: Boolean,
      default: false,
    },
  },

  setup (props) {
    const { getLatestVersion } = useVueVersionCheck()
    const latestVersion = computed(() => getLatestVersion(props.app.version))
    const hasNewVersion = computed(() => latestVersion.value !== props.app.version)

    return {
      latestVersion,
      hasNewVersion,
    }
  },
})
</script>

<template>
  <div class="leading-tight">
    <div class="app-button flex items-center">
      <span class="truncate flex-1">{{ app.name }}</span>
      <span
        class="flex-none flex items-center"
        :class="{
          'opacity-40': !selected,
        }"
      >
        <img
          src="~@front/assets/vue-logo.svg"
          class="w-6 h-6"
          alt="Vue"
        >
        <span>{{ app.version }}</span>
        <span
          v-if="hasNewVersion"
          class="ml-2 text-sm text-green-500 flex items-center space-x-0.5"
        >
          <VueIcon
            icon="new_releases"
            class="w-5 h-5"
          />
          <span>{{ latestVersion }}</span>
        </span>
      </span>

      <template v-if="$shared.debugInfo">
        <span
          v-tooltip="'id'"
          class="text-white px-1 rounded bg-gray-500 mx-1"
        >
          {{ app.id }}
        </span>
      </template>
    </div>
    <div
      v-if="app.iframe"
      class="flex items-center space-x-1 text-2xs font-mono text-gray-500"
    >
      <VueIcon
        icon="web"
        class="w-4 h-4"
      />
      <span>{{ app.iframe }}</span>
    </div>
  </div>
</template>
