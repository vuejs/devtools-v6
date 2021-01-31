<script>
import PluginSourceIcon from '../plugin/PluginSourceIcon.vue'

export default {
  components: {
    PluginSourceIcon
  },

  props: {
    layer: {
      type: Object,
      required: true
    },

    hover: {
      type: Boolean,
      default: false
    },

    selected: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template>
  <div class="relative">
    <div
      class="border-b border-gray-200 dark:border-gray-900"
      :style="{
        height: `${(layer.height + 1) * 16}px`
      }"
    >
      <div class="flex items-center space-x-2 px-2 py-1">
        <div
          class="flex-none w-3 h-3 rounded-full"
          :style="{
            backgroundColor: `#${layer.color.toString(16)}`
          }"
        />
        <div class="flex-1 truncate text-sm">
          {{ layer.label }}
        </div>

        <PluginSourceIcon
          v-if="layer.pluginId"
          :plugin-id="layer.pluginId"
        />
      </div>
    </div>

    <div
      v-if="hover || selected"
      class="absolute inset-0 pointer-events-none"
      :style="{
        backgroundColor: `#${layer.color.toString(16)}`,
        opacity: hover ? 0.1 : 0.05
      }"
    />
  </div>
</template>
