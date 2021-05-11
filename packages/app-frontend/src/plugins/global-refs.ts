interface Options {
  refs: { [key: string]: any }
}

export default {
  install (Vue, options: Options) {
    const { refs } = options
    const wrapper = {}
    Object.keys(refs).forEach(key => {
      const get = refs[key]
      Object.defineProperty(wrapper, key, {
        get
      })
    })
    Vue.prototype.$globalRefs = wrapper
  }
}
