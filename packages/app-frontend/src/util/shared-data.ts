import { onUnmounted } from 'vue'
import { watchSharedData } from '@vue-devtools/shared-utils'

export function onSharedDataChange (prop, handler) {
  const off = watchSharedData(prop, handler)

  onUnmounted(() => {
    off()
  })
}
