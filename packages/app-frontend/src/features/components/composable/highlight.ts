import { useBridge } from '@front/features/bridge'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { Ref } from '@vue/composition-api'

function handleThrottle (duration = 200) {
  let lastExec = 0
  let timer: ReturnType<typeof setTimeout> | undefined
  let isExecuting = false

  const clear = () => {
    if (timer) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  function exec (fn) {
    const elapsed = Date.now() - lastExec

    if (isExecuting) {
      clear()
      timer = setTimeout(() => {
        isExecuting = true
        lastExec = Date.now()
        fn()
      }, duration)
    } else if (elapsed > duration) {
      fn()
      lastExec = Date.now()
      timer = setTimeout(() => {
        isExecuting = false
      }, duration)
    }
    isExecuting = true
  }

  return exec
}

const exec = handleThrottle()

export function useComponentHighlight (id: Ref<string>) {
  const { bridge } = useBridge()

  function highlight () {
    exec(() => bridge.send(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OVER, id.value))
  }

  function unhighlight () {
    exec(() => bridge.send(BridgeEvents.TO_BACK_COMPONENT_MOUSE_OUT))
  }

  return {
    highlight,
    unhighlight,
  }
}
