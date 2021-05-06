import { defineComponent, reactive, h } from 'vue'

export default defineComponent({
  name: 'SetupRender',

  setup () {
    const state = reactive({
      name: 'Foo bar'
    })

    return () => {
      return h('h1', state.name)
    }
  }
})
