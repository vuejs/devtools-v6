import { getCurrentInstance, computed } from '@vue/composition-api'

export function useRouter () {
  return getCurrentInstance().proxy.$router
}

export function useRoute () {
  const vm = getCurrentInstance()
  return computed(() => vm.proxy.$route)
}
