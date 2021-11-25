import { Ref, watch } from '@vue/composition-api'

export function nonReactive<T> (ref: Ref<T>) {
  const holder = {
    value: ref.value,
  }

  watch(ref, value => {
    holder.value = value
  })

  return holder
}
