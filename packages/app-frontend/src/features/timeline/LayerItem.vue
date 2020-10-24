<script>
export default {
  props: {
    layer: {
      type: Object,
      required: true
    },

    hover: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<template>
  <div class="relative">
    <div class="h-8 flex items-center space-x-4 px-4 border-b border-gray-200 dark:border-gray-900">
      <div
        class="w-3 h-3 rounded-full"
        :style="{
          backgroundColor: `#${layer.color.toString(16)}`
        }"
      />
      <div class="flex-1 truncate text-sm">
        {{ layer.label }}
      </div>
    </div>

    <div
      v-if="hover"
      class="absolute inset-0 pointer-events-none"
      :style="{
        backgroundColor: `#${layer.color.toString(16)}`,
        opacity: 0.1
      }"
    />
  </div>
</template>
