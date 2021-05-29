<script>
import { reactive, watch } from '@vue/composition-api'
import { BridgeEvents } from '@utils/consts'
import { useBridge } from '@front/features/bridge'
import { darkMode } from '@front/util/theme'

const CodeEditor = () => import(
  /* webpackChunkName: "CodeEditor" */
  '@front/features/code/CodeEditor.vue'
)

export default {
  components: {
    CodeEditor
  },

  props: {
    instanceId: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const {
      onBridge,
      bridge
    } = useBridge()

    const result = reactive({
      code: ''
    })

    let pendingId

    watch(() => props.instanceId, value => {
      pendingId = value
      bridge.send(BridgeEvents.TO_BACK_COMPONENT_RENDER_CODE, { instanceId: value })
    }, { immediate: true })

    onBridge(BridgeEvents.TO_FRONT_COMPONENT_RENDER_CODE, ({ instanceId, code }) => {
      if (instanceId === pendingId) {
        result.code = code
      }
    })

    return {
      result,
      darkMode
    }
  }
}
</script>

<template>
  <div class="bg-white dark:bg-black flex flex-col overflow-hidden">
    <div class="flex items-center px-2 py-1 space-x-2 flex-none">
      <div class="flex-1">
        Render code
      </div>
      <VueButton
        class="icon-button flat flex-none"
        icon-left="close"
        @click="$emit('close')"
      />
    </div>

    <CodeEditor
      v-model="result.code"
      :options="{
        readOnly: true,
        minimap: {
          enabled: false
        }
      }"
      :theme="darkMode ? 'github-dark' : 'github-light'"
      language="javascript"
      class="flex-1"
    />
  </div>
</template>
