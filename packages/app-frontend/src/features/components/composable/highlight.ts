import { useBridge } from '@front/features/bridge'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { Ref } from '@vue/composition-api'

function createThrottleFn (duration = 200) {
  let timer: ReturnType<typeof setTimeout> | undefined
  let isExecuting = false

  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  function exec (fn) {
    if (isExecuting) {
      clear()
      timer = setTimeout(() => {
        isExecuting = true
        fn()
      }, duration)
    } else {
      timer = setTimeout(() => {
        isExecuting = false
      }, duration)
      fn()
    }
    isExecuting = true
  }

  return exec
}

const execThrottleFn = createThrottleFn()

export function useComponentHighlight (id: Ref<string>) {
  const { bridge } = useBridge()

  function highlight () {
    execThrottleFn(() => bridge.send(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, id.value))
  }

  function unhighlight () {
    execThrottleFn(() => bridge.send(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT))
  }

  return {
    highlight,
    unhighlight,
  }
}
