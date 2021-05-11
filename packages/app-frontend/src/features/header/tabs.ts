import { computed } from '@vue/composition-api'
import { useRoute } from '@front/util/router'

export function useTabs () {
  const route = useRoute()
  const currentTab = computed<string>(() => {
    let fromMeta = route.value.meta.tab
    if (typeof fromMeta === 'function') {
      fromMeta = fromMeta(route.value)
    }
    return fromMeta || route.value.name
  })

  return {
    currentTab
  }
}
