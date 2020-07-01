import { computed } from '@vue/composition-api'
import { useRoute } from '@front/util/router'

export function useTabs () {
  const route = useRoute()
  const currentTab = computed(() => route.value.meta.tab || route.value.name)

  return {
    currentTab
  }
}
