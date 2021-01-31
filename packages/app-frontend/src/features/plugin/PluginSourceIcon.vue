<script>
import { usePlugins } from '.'
import { computed } from '@vue/composition-api'
import { useRouter } from '@front/util/router'

export default {
  props: {
    pluginId: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const {
      plugins
    } = usePlugins()

    const plugin = computed(() => plugins.value.find(p => p.id === props.pluginId))

    const router = useRouter()
    function go () {
      router.push({
        name: 'plugin-details',
        params: {
          pluginId: props.pluginId
        }
      })
    }

    return {
      plugin,
      go
    }
  }
}
</script>

<template>
  <VTooltip
    class="leading-none"
  >
    <VueIcon
      icon="extension"
      class="opacity-25 hover:opacity-100 cursor-pointer"
      @click.stop="go()"
    />

    <template #popper>
      <div class="flex space-x-3 items-center">
        <div class="flex items-center justify-center w-8 h-8 bg-gray-700 dark:bg-gray-200 rounded-full">
          <VueIcon
            icon="extension"
          />
        </div>
        <div>
          <div>Provided by <b>{{ plugin ? plugin.label : pluginId }}</b></div>
          <div
            v-if="plugin"
            class="opacity-50"
          >
            <div>ID: {{ plugin.id }}</div>
          </div>
        </div>
      </div>
    </template>
  </VTooltip>
</template>
