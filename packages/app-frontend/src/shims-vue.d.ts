declare module '*.vue' {
  import type { defineComponent } from 'vue'

  export default ReturnType<typeof defineComponent>
}
