<script>
import { computed } from '@vue/composition-api'
import { hasPluginPermission, setPluginPermission } from '@vue-devtools/shared-utils'
export default {
  props: {
    pluginId: {
      type: String,
      required: true
    },

    permission: {
      type: String,
      required: true
    },

    label: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const model = computed({
      get () {
        return hasPluginPermission(props.pluginId, props.permission)
      },
      set (value) {
        setPluginPermission(props.pluginId, props.permission, value)
      }
    })

    return {
      model
    }
  }
}
</script>

<template>
  <VueSwitch
    v-model="model"
    class="right w-full hover:bg-green-50 dark:bg-green-900"
  >
    {{ label }}
  </VueSwitch>
</template>
