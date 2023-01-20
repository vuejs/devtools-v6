<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from '@front/util/router'
import PluginSourceDescription from './PluginSourceDescription.vue'

export default defineComponent({
  components: {
    PluginSourceDescription,
  },

  props: {
    pluginId: {
      type: String,
      required: true,
    },
  },

  setup (props) {
    const router = useRouter()
    function go () {
      router.push({
        name: 'plugin-details',
        params: {
          pluginId: props.pluginId,
        },
      })
    }

    return {
      go,
    }
  },
})
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
      <PluginSourceDescription
        :plugin-id="pluginId"
      />
    </template>
  </VTooltip>
</template>
