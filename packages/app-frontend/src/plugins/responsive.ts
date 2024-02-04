import type { ComputedRef, Plugin, Ref } from 'vue'
import { computed, inject, reactive, toRefs } from 'vue'

export interface Responsive {
  wide: ComputedRef<boolean>
  tall: ComputedRef<boolean>
  width: Ref<number>
  height: Ref<number>
}

const responsiveKey = Symbol('responsive')

export default {
  install(app) {
    function buildResponsive() {
      const data = reactive({
        width: window.innerWidth,
        height: window.innerHeight,
      })

      const wide = computed(() => data.width >= 1050)
      const tall = computed(() => data.height >= 350)

      return {
        ...toRefs(data),
        wide,
        tall,
      }
    }

    const responsive = buildResponsive()

    app.config.globalProperties.$responsive = responsive

    app.provide(responsiveKey, responsive)

    window.addEventListener('resize', () => {
      responsive.width.value = window.innerWidth
      responsive.height.value = window.innerHeight
    })
  },
} as Plugin

export const useResponsive = () => inject<Responsive>(responsiveKey)
