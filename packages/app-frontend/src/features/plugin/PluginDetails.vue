<script>
import { usePlugins } from '.'
import { computed } from '@vue/composition-api'

export default {
  props: {
    pluginId: {
      type: [String, Number],
      required: true
    }
  },

  setup (props) {
    const { plugins } = usePlugins()
    const plugin = computed(() => plugins.value.find(p => p.id === props.pluginId))

    return {
      plugin
    }
  }
}
</script>

<template>
  <div
    v-if="plugin"
    class="h-full overflow-y-auto"
  >
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex space-x-6">
      <div class="flex items-center justify-center w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full">
        <VueIcon
          icon="extension"
          class="big text-gray-500"
        />
      </div>
      <div>
        <div class="font-bold">
          {{ plugin.label }}
        </div>
        <div v-if="plugin.homepage">
          <a
            :href="plugin.homepage"
            target="_blank"
            class="flex items-center text-green-600 dark:text-green-400 space-x-1"
          >
            <span>Homepage</span>
            <VueIcon
              icon="launch"
            />
          </a>
        </div>
        <div>
          ID: <span class="font-mono text-sm px-1 bg-gray-200 rounded">{{ plugin.id }}</span>
        </div>
        <div v-if="plugin.packageName">
          Package: <span class="font-mono text-sm px-1 bg-gray-200 rounded">{{ plugin.packageName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
