import { watchSharedData } from '@utils/shared-data'
import { onUnmounted } from '@vue/composition-api'

export function onSharedDataChange (prop, handler) {
  const off = watchSharedData(prop, handler)

  onUnmounted(() => {
    off()
  })
}
