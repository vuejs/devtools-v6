import { computed } from 'vue'
import { useRoute } from 'vue-router'

export function useTabs() {
  const route = useRoute()
  const currentTab = computed<string>(() => {
    let fromMeta = route.meta.tab
    if (typeof fromMeta === 'function') {
      fromMeta = fromMeta(route)
    }
    return (fromMeta || route.name) as string
  })

  return {
    currentTab,
  }
}
