import { onBeforeUnmount, onMounted } from 'vue'

let count = 0

function getScrollingElements() {
  return document.querySelectorAll('.vue-ui-disable-scroll, body')
}

function updateScroll() {
  if (count === 0) {
    getScrollingElements().forEach(el =>
      el.classList.remove('vue-ui-no-scroll'),
    )
  }
  else if (count === 1) {
    getScrollingElements().forEach(el => el.classList.add('vue-ui-no-scroll'))
  }
}

export function useDisableScroll() {
  onMounted(() => {
    count++
    updateScroll()
  })

  onBeforeUnmount(() => {
    count--
    updateScroll()
  })
}
