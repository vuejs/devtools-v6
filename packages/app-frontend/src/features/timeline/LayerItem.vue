<script>
export default {
  props: {
    layer: {
      type: Object,
      required: true
    }
  }
}
</script>

<template>
  <div class="h-8 flex items-center space-x-4 px-4 border-b border-gray-200 dark:border-gray-800">
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
</template>
