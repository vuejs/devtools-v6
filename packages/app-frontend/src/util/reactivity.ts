import { Ref, watch } from '@vue/composition-api'

export function nonReactive<T> (ref: Ref<T>) {
  const holder = {
    value: ref.value,
  }

  watch(ref, value => {
    holder.value = value
  }, {
    flush: 'sync',
  })

  return holder
}

export function addNonReactiveProperties (target: any, props: any) {
  for (const key in props) {
    Object.defineProperty(target, key, {
      value: props[key],
      writable: true,
      enumerable: true,
      configurable: false,
    })
  }
}
