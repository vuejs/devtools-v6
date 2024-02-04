import type { App } from 'vue'

interface Options {
  refs: { [key: string]: any }
}

export default {
  install(app: App, options: Options) {
    const { refs } = options
    const wrapper = {}
    Object.keys(refs).forEach((key) => {
      const get = refs[key]
      Object.defineProperty(wrapper, key, {
        get,
      })
    })
    app.config.globalProperties.$globalRefs = wrapper
  },
}
