import { Ref, watch } from 'vue'
import { getStorage, setStorage } from '@vue-devtools/shared-utils'

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

export function addNonReactiveProperties<T = any> (target: T, props: Partial<T>) {
  for (const key in props) {
    Object.defineProperty(target, key, {
      value: props[key],
      writable: true,
      enumerable: true,
      configurable: false,
    })
  }
}

export function useSavedRef<T> (ref: Ref<T>, storageKey: string) {
  const savedValue = getStorage(storageKey)
  if (savedValue != null) {
    ref.value = savedValue
  }

  watch(ref, value => {
    setStorage(storageKey, value)
  })
}
