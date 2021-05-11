import { onUnmounted } from '@vue/composition-api'
import { watchSharedData } from '@utils/shared-data'

export function onSharedDataChange (prop, handler) {
  const off = watchSharedData(prop, handler)

  onUnmounted(() => {
    off()
  })
}
