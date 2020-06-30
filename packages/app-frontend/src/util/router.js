import { getCurrentInstance, computed } from '@vue/composition-api'

export function useRouter () {
  return getCurrentInstance().$router
}

export function useRoute () {
  const vm = getCurrentInstance()
  return computed(() => vm.$route)
}
