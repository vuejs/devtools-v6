<script lang="ts">
import PluginSourceIcon from '@front/features/plugin/PluginSourceIcon.vue'

import { defineComponent, PropType, computed } from '@vue/composition-api'
import { useDarkMode } from '@front/util/theme'
import { toStrHex, dimColor, boostColor } from '@front/util/color'
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
  },

  setup (props, { emit }) {
    function select () {
      emit('select')
    }

    const { darkMode } = useDarkMode()

    const color = computed(() => toStrHex(props.layer.color))
    const dimmedColor = computed(() => toStrHex(dimColor(props.layer.color, darkMode.value)))
    const boostedColot = computed(() => toStrHex(boostColor(props.layer.color, darkMode.value)))

    return {
      select,
      color,
      dimmedColor,
      boostedColot
    }
  }
})
</script>

<template>
  <div
    class="relative group cursor-pointer"
    @click="select()"
  >
    <div
      class="border-b border-gray-200 dark:border-gray-800"
      :style="{
        height: `${(layer.height + 1) * 16}px`
      }"
    >
      <div class="flex items-center space-x-2 px-2 py-1">
        <div
          class="flex-none w-3 h-3 relative"
          :class="{
            'opacity-50': layer.id === 'performance' && !$shared.performanceMonitoringEnabled,
          }"
        >
          <div
            class="absolute inset-0 rounded-full transition-colors duration-300 ease-in-out"
            :style="{
              backgroundColor: `#${selected ? boostedColot : color}`,
            }"
          />
          <transition
            enter-active-class="transform transition-transform duration-300 ease-in-out"
            leave-active-class="transform transition-transform duration-300 ease-in-out"
            enter-class="scale-0"
            leave-to-class="scale-0"
          >
            <div
              v-if="selected"
              class="absolute inset-0.5 rounded-full z-10"
              :style="{
                backgroundColor: `#${dimmedColor}`,
              }"
            />
          </transition>
        </div>

        <div class="flex-1 overflow-hidden flex items-center space-x-2">
          <span
            class="truncate text-sm"
            :class="{
              'opacity-50': layer.id === 'performance' && !$shared.performanceMonitoringEnabled,
            }"
            :style="{
              'color': selected ? `#${color}` : undefined
            }"
          >{{ layer.label }}</span>

          <PluginSourceIcon
            v-if="layer.pluginId"
            :plugin-id="layer.pluginId"
            @click.native.stop
          />
        </div>

        <div class="flex items-center space-x-1">
          <VueButton
            v-if="hover && layer.id === 'performance'"
            class="text-xs px-1 py-0 h-5 hover:opacity-80"
            :style="{
              backgroundColor: `#${color}28`,
            }"
            @click.stop="$shared.performanceMonitoringEnabled = !$shared.performanceMonitoringEnabled"
          >
            {{ $shared.performanceMonitoringEnabled ? 'Disable' : 'Enable' }}
          </VueButton>

          <VueButton
            v-if="hover"
            class="text-xs px-1 py-0 h-5 hover:opacity-80"
            :style="{
              backgroundColor: `#${color}28`,
            }"
          >
            Select
          </VueButton>
        </div>
      </div>
    </div>

    <div
      v-if="hover || selected"
      class="absolute inset-0 pointer-events-none"
      :style="{
        backgroundColor: `#${color}`,
        opacity: hover ? 0.1 : 0.05
      }"
    />
  </div>
</template>
