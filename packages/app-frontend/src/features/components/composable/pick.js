import { ref } from '@vue/composition-api'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { useBridge } from '@front/features/bridge'
import { useComponentRequests, setComponentOpen } from '.'

export function useComponentPick () {
  const { bridge, onBridge } = useBridge()
  const { selectComponent, requestComponentTree } = useComponentRequests()

  const pickingComponent = ref(false)

  function startPickingComponent () {
    pickingComponent.value = true
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_PICK)
  }

  function stopPickingComponent () {
    pickingComponent.value = false
    bridge.send(BridgeEvents.TO_BACK_COMPONENT_PICK_CANCELED)
  }

  onBridge(BridgeEvents.TO_FRONT_COMPONENT_PICK, ({ id, parentIds }) => {
    pickingComponent.value = false
    selectComponent(id)
    parentIds.reverse().forEach(id => {
      // Ignore root
      if (id.endsWith('root')) return
      setComponentOpen(id, true)
      requestComponentTree(id)
    })
  })

  onBridge(BridgeEvents.TO_FRONT_COMPONENT_PICK_CANCELED, () => {
    pickingComponent.value = false
  })

  return {
    pickingComponent,
    startPickingComponent,
    stopPickingComponent
  }
}
