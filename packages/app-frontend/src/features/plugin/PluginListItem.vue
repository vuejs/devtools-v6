<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api'
import { hasPluginPermission, PluginPermission } from '@vue-devtools/shared-utils'

export default defineComponent({
  props: {
    plugin: {
      type: Object,
      required: true
    }
  },

  setup (props) {
    const enabled = computed(() => hasPluginPermission(props.plugin.id, PluginPermission.ENABLED))
    return {
      enabled
    }
  }
})
</script>

<template>
  <router-link
    :to="{
      name: 'plugin-details',
      params: {
        pluginId: plugin.id
      }
    }"
    class="flex items-center space-x-2 px-3 py-1 hover:bg-green-100 dark:hover:bg-green-800"
    :class="{
      'disabled opacity-50': !enabled,
    }"
    active-class="text-green-500 bg-green-50 dark:bg-green-900"
  >
    <VueIcon
      icon="extension"
    />

    <span>{{ plugin.label }}</span>

    <span
      v-if="!enabled"
      class="bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs rounded px-1"
    >
      disabled
    </span>
  </router-link>
</template>

<style lang="postcss" scoped>
.vue-ui-icon /deep/ svg {
  fill: currentColor;
}
</style>
