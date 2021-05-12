<script lang="ts">
import PluginSourceIcon from '@front/features/plugin/PluginSourceIcon.vue'

import { defineComponent, PropType } from '@vue/composition-api'
import { Layer } from './composable'

export default defineComponent({
  components: {
    PluginSourceIcon
  },

  props: {
    layer: {
      type: Object as PropType<Layer>,
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
})
</script>

<template>
  <div class="relative group">
    <div
      class="border-b border-gray-200 dark:border-gray-900"
      :style="{
        height: `${(layer.height + 1) * 16}px`
      }"
    >
      <div class="flex items-center space-x-2 px-2 py-1">
        <div
          class="flex-none w-3 h-3 relative cursor-pointer"
          @click="$emit('select')"
        >
          <div
            class="absolute inset-0 rounded-full"
            :style="{
              backgroundColor: `#${layer.color.toString(16)}`
            }"
          />
          <transition
            appear
            enter-active-class="transform transition-transform duration-300 ease-in-out"
            leave-active-class="transform transition-transform duration-300 ease-in-out"
            enter-class="scale-0"
            leave-to-class="scale-0"
          >
            <div
              v-if="selected"
              class="absolute inset-0.5 rounded-full bg-white dark:bg-black z-10"
            />
          </transition>
        </div>
        <div class="flex-1 overflow-hidden flex items-center space-x-2">
          <span
            class="truncate text-sm cursor-pointer"
            @click="$emit('select')"
          >{{ layer.label }}</span>

          <PluginSourceIcon
            v-if="layer.pluginId"
            :plugin-id="layer.pluginId"
          />
        </div>

        <VueButton
          class="text-xs px-1 py-0 h-6 opacity-0 group-hover:opacity-100"
          :style="{
            backgroundColor: `#${layer.color.toString(16)}28`,
          }"
          @click="$emit('select')"
        >
          Select
        </VueButton>
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
