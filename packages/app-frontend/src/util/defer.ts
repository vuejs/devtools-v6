import { ref, onMounted } from 'vue'

export function useDefer (count = 10) {
  const displayPriority = ref(0)

  function step () {
    requestAnimationFrame(() => {
      displayPriority.value++
      if (displayPriority.value < count) {
        step()
      }
    })
  }

  function runDisplayPriority () {
    step()
  }

  function defer (priority) {
    return displayPriority.value >= priority
  }

  onMounted(() => {
    runDisplayPriority()
  })

  return {
    defer,
  }
}
