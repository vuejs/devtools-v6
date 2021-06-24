<script lang="ts">
import * as PIXI from 'pixi.js-legacy'
import { install as installUnsafeEval } from '@pixi/unsafe-eval'
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  watchEffect,
  defineComponent
} from '@vue/composition-api'
import Vue from 'vue'
import {
  useLayers,
  useTime,
  useSelectedEvent,
  selectEvent,
  onTimelineReset,
  onEventAdd,
  useCursor,
  Layer,
  TimelineEvent
} from './composable'
import { useApps } from '@front/features/apps'
import { onKeyUp } from '@front/util/keyboard'
import SharedData from '@utils/shared-data'
import { useDarkMode } from '@front/util/theme'
import { dimColor, boostColor } from '@front/util/color'

const LAYER_SIZE = 16
const GROUP_SIZE = 6
const MIN_CAMERA_SIZE = 10

installUnsafeEval(PIXI)

export default defineComponent({
  setup () {
    const wrapper = ref<HTMLElement>(null)

    const { currentAppId } = useApps()
    const { startTime, endTime, minTime, maxTime } = useTime()
    const { darkMode } = useDarkMode()

    // Reset

    type ResetCb = () => void

    const resetCbs: ResetCb[] = []

    function onReset (cb: ResetCb) {
      resetCbs.push(cb)
    }

    function reset () {
      for (const cb of resetCbs) {
        cb()
      }
    }

    watch(currentAppId, () => reset())

    onTimelineReset(reset)

    // Pixi App

    let app: PIXI.Application

    let verticalScrollingContainer: PIXI.Container
    let horizontalScrollingContainer: PIXI.Container

    onMounted(() => {
      app = new PIXI.Application({
        resizeTo: wrapper.value,
        antialias: true,
        autoDensity: true
      })
      app.stage.interactive = true
      app.stage.hitArea = new PIXI.Rectangle(0, 0, 100000, 100000)
      updateBackground()
      wrapper.value.appendChild(app.view)
      app.view.style.opacity = '0'
      app.renderer.on('postrender', () => {
        app.view.style.opacity = '1'
      })

      verticalScrollingContainer = new PIXI.Container()
      app.stage.addChild(verticalScrollingContainer)

      horizontalScrollingContainer = new PIXI.Container()
      verticalScrollingContainer.addChild(horizontalScrollingContainer)
    })

    onUnmounted(() => {
      app.destroy()
    })

    function updateBackground () {
      if (darkMode.value) {
        app && (app.renderer.backgroundColor = 0x0b1015)
      } else {
        app && (app.renderer.backgroundColor = 0xffffff)
      }
    }

    watchEffect(() => {
      updateBackground()
    })

    // Layers

    const {
      layers,
      vScroll,
      hoverLayerId,
      selectedLayer
    } = useLayers()

    let layerContainers: PIXI.Container[] = []
    let layersMap: Record<Layer['id'], { layer: Layer, container: PIXI.Container }> = {}

    function initLayers () {
      let y = 0
      for (const layer of layers.value) {
        const container = new PIXI.Container()
        container.y = y
        y += (layer.height + 1) * LAYER_SIZE
        horizontalScrollingContainer.addChild(container)
        // allow z-index sorting
        container.sortableChildren = true
        layerContainers.push(container)
        layersMap[layer.id] = {
          layer,
          container
        }
      }
    }

    function updateLayerPositions () {
      let y = 0
      for (const layer of layers.value) {
        const payload = layersMap[layer.id]
        if (payload) {
          payload.container.y = y
        }
        y += (layer.height + 1) * LAYER_SIZE
      }
    }

    onMounted(() => {
      initLayers()
    })

    function resetLayers () {
      for (const container of layerContainers) {
        container.destroy()
      }
      layerContainers = []
      layersMap = {}
      initLayers()
      resetEvents()
    }

    onReset(() => {
      resetLayers()
    })

    watch(() => layers.value.map(l => l.id).join(','), () => {
      resetLayers()
    })

    // Layer hover

    let layerHoverEffect: PIXI.Graphics

    onMounted(() => {
      layerHoverEffect = new PIXI.Graphics()
      layerHoverEffect.alpha = 0.1
      layerHoverEffect.visible = false
      verticalScrollingContainer.addChild(layerHoverEffect)
    })

    function getLayerY (layer: Layer) {
      return layers.value.slice(0, layers.value.indexOf(layer)).reduce((sum, layer) => sum + (layer.height + 1) * LAYER_SIZE, 0)
    }

    function drawLayerBackgroundEffects () {
      if (!layerHoverEffect) return

      const layerIds = [
        {
          id: hoverLayerId.value,
          alpha: 1
        },
        {
          id: hoverLayerId.value !== selectedLayer.value?.id ? selectedLayer.value?.id : null,
          alpha: 0.5
        }
      ].filter(({ id }) => id != null)

      if (layerIds.length) {
        layerHoverEffect.clear()
        layerIds.forEach(({ id, alpha }) => drawLayerBackground(id, alpha))
        layerHoverEffect.visible = true
      } else {
        layerHoverEffect.visible = false
      }
    }

    function drawLayerBackground (layerId: Layer['id'], alpha = 1) {
      const { layer } = layersMap[layerId]
      layerHoverEffect.beginFill(layer.color, alpha)
      layerHoverEffect.drawRect(0, getLayerY(layer), app.view.width, (layer.height + 1) * LAYER_SIZE)
    }

    watch(hoverLayerId, () => {
      drawLayerBackgroundEffects()
    })

    watch(selectedLayer, () => {
      drawLayerBackgroundEffects()
    })

    function updateLayerHover (event: MouseEvent) {
      let { offsetY } = event
      offsetY -= verticalScrollingContainer.y
      if (offsetY >= 0) {
        let y = 0
        // Find the hovering layer depending on each layer's height
        for (const layer of layers.value) {
          y += (layer.height + 1) * LAYER_SIZE
          if (offsetY <= y) {
            hoverLayerId.value = layer.id
            return
          }
        }
      }
      clearLayerHover()
    }

    function clearLayerHover () {
      hoverLayerId.value = null
    }

    // Events

    const { selectedEvent } = useSelectedEvent()

    let events: TimelineEvent[] = []

    function getEventPosition (event: TimelineEvent) {
      return (event.time - minTime.value) / (endTime.value - startTime.value) * app.view.width
    }

    const updateEventPositionQueue = new Set<TimelineEvent>()
    let currentEventPositionUpdate: TimelineEvent = null
    let updateEventPositionQueued = false

    function queueEventPositionUpdate (...events: TimelineEvent[]) {
      for (const e of events) {
        if (!e.container) continue
        const ignored = isEventIgnored(e)
        e.container.visible = !ignored
        if (ignored) continue
        // Update horizontal position immediately
        e.container.x = getEventPosition(e)
        // Queue vertical position compute
        updateEventPositionQueue.add(e)
      }
      if (!updateEventPositionQueued) {
        updateEventPositionQueued = true
        Vue.nextTick(() => {
          nextEventPositionUpdate()
          updateEventPositionQueued = false
        })
      }
    }

    function nextEventPositionUpdate () {
      if (currentEventPositionUpdate) return
      const event = currentEventPositionUpdate = updateEventPositionQueue.values().next().value
      if (event) {
        computeEventVerticalPosition(event)
      }
    }

    function isEventIgnored (event: TimelineEvent) {
      return event.layer.ignoreNoDurationGroups && event.group && event.group.duration <= 0
    }

    function computeEventVerticalPosition (event: TimelineEvent) {
      const offset = event.layer.groupsOnly ? 0 : 12

      let y = 0
      if (event.group && event !== event.group.firstEvent) {
        // If the event is inside a group, just use the group position
        y = event.group.y
      } else {
        const firstEvent = event.group ? event.group.firstEvent : event
        const lastEvent = event.group ? event.group.lastEvent : event
        const lastOffset = event.layer.groupsOnly && event.group?.duration > 0 ? -1 : 0
        // Check for 'collision' with other event groups
        const l = event.layer.groups.length
        let checkAgain = true
        while (checkAgain) {
          checkAgain = false
          for (let i = 0; i < l; i++) {
            const otherGroup = event.layer.groups[i]
            if (
              // Different group
              (
                !event.group ||
                event.group !== otherGroup
              ) &&
              // Same row
              otherGroup.y === y &&
              (
                // Horizontal intersection (first event)
                (
                  getEventPosition(firstEvent) >= getEventPosition(otherGroup.firstEvent) - offset &&
                  getEventPosition(firstEvent) <= getEventPosition(otherGroup.lastEvent) + offset + lastOffset
                ) ||
                // Horizontal intersection (last event)
                (
                  getEventPosition(lastEvent) >= getEventPosition(otherGroup.firstEvent) - offset - lastOffset &&
                  getEventPosition(lastEvent) <= getEventPosition(otherGroup.lastEvent) + offset
                )
              )
            ) {
              // Collision!
              if (event.group && event.group.duration > otherGroup.duration && firstEvent.time <= otherGroup.firstEvent.time) {
                // Invert positions because current group has higher priority
                queueEventPositionUpdate(otherGroup.firstEvent)
              } else {
                // Offset the current group/event
                y++
                // We need to check all the layers again since we moved the event
                checkAgain = true
                break
              }
            }
          }
        }

        // If the event is the first in a group, update group position
        if (event.group) {
          event.group.y = y
        }

        // Might update the layer's height as well
        if (y + 1 > event.layer.height) {
          const oldLayerHeight = event.layer.height
          const newLayerHeight = event.layer.height = y + 1
          if (oldLayerHeight !== newLayerHeight) {
            updateLayerPositions()
            drawLayerBackgroundEffects()
          }
        }
      }
      event.container.y = (y + 1) * LAYER_SIZE

      // Next
      updateEventPositionQueue.delete(event)
      currentEventPositionUpdate = null
      nextEventPositionUpdate()
    }

    function addEvent (event: TimelineEvent, layerContainer: PIXI.Container) {
      // Container
      const eventContainer = new PIXI.Container()
      event.container = eventContainer
      layerContainer.addChild(eventContainer)

      // Group graphics
      if (event.group) {
        if (event.group.firstEvent === event) {
          const groupG = new PIXI.Graphics()
          event.groupG = groupG
          eventContainer.addChild(groupG)
          drawEventGroup(event)
        } else if (event.group.lastEvent === event) {
          drawEventGroup(event.group.firstEvent)
          // We need to check for collisions again
          Vue.nextTick(() => queueEventsUpdate())
        }
      }

      // Graphics
      const g = new PIXI.Graphics()
      event.g = g
      eventContainer.addChild(g)

      events.push(event)

      refreshEventGraphics(event)
      queueEventPositionUpdate(event)

      return event
    }

    function initEvents () {
      for (const k in layersMap) {
        const { layer, container } = layersMap[k]
        for (const event of layer.events) {
          addEvent(event, container)
        }
      }
    }

    onMounted(() => {
      initEvents()
    })

    function clearEvents () {
      for (const e of events) {
        e.g.destroy()
        e.g = null

        if (e.groupT) {
          (e.groupT.mask as PIXI.Graphics).destroy()
          e.groupT.destroy()
          e.groupT = null
        }

        if (e.groupG) {
          e.groupG.destroy()
          e.groupG = null
        }

        e.container.destroy()
        e.container = null
      }
      events = []
    }

    function resetEvents () {
      clearEvents()
      initEvents()
    }

    onUnmounted(() => {
      clearEvents()
    })

    onEventAdd((event: TimelineEvent) => {
      if (event.appId !== 'all' && event.appId !== currentAppId.value) return

      const layer = layersMap[event.layer.id]
      if (layer) {
        addEvent(event, layer.container)
      }
    })

    let eventsUpdateQueued = false

    function queueEventsUpdate () {
      if (eventsUpdateQueued) return
      eventsUpdateQueued = true
      Vue.nextTick(() => {
        updateEvents()
        eventsUpdateQueued = false
      })
    }

    function updateEvents () {
      for (const layer of layers.value) {
        layer.height = 1
      }
      updateLayerPositions()
      queueEventPositionUpdate(...events)
      for (const event of events) {
        if (event.groupG) {
          drawEventGroup(event)
        }
      }
    }

    watch(startTime, () => queueEventsUpdate())
    watch(endTime, () => queueEventsUpdate())
    watch(minTime, () => queueEventsUpdate())

    // Event selection

    onMounted(() => {
      app.stage.addListener('click', event => {
        const targetX = event.data.global.x
        const targetY = event.data.global.y
        let choice: TimelineEvent

        let y = 0
        for (const layer of layers.value) {
          y += (layer.height + 1) * LAYER_SIZE
          if (targetY - verticalScrollingContainer.y < y) {
            let distance = Number.POSITIVE_INFINITY
            for (const e of layer.events) {
              if (isEventIgnored(e)) continue

              if (layer.groupsOnly) {
                // We find the group inside of which the mouse is
                const bounds = e.group.firstEvent.groupG.getBounds()
                if (bounds.contains(targetX, targetY)) {
                  choice = e
                  break
                }
              } else {
                if (!e.g) continue
                // We find the nearest event from the mouse click position
                const globalPosition = e.g.getGlobalPosition()
                const d = Math.abs(globalPosition.x - targetX) + Math.abs(globalPosition.y - targetY)

                if (!choice || d < distance) {
                  choice = e
                  distance = d
                }
              }
            }
            break
          }
        }

        if (choice) {
          selectEvent(choice)
        }
      })
    })

    function drawEvent (selected: boolean, event: TimelineEvent) {
      if (event) {
        let color = event.layer.color
        if (event.logType === 'error') {
          color = 0xE53E3E
        } else if (event.logType === 'warning') {
          color = 0xECC94B
        }

        if (event.g) {
          /** @type {PIXI.Graphics} */
          const g = event.g
          let size = 3
          g.clear()
          if (!event.layer.groupsOnly) {
            if (selected) {
              // Border-only style
              size--
              g.lineStyle(2, boostColor(color, darkMode.value))
              g.beginFill(dimColor(color, darkMode.value))
              if (!event.group || event.group.firstEvent !== event) {
                event.container.zIndex = 999999999
              }
            } else {
              g.beginFill(color)
              if (!event.group || event.group.firstEvent !== event) {
                event.container.zIndex = size
              }
            }
            g.drawCircle(0, 0, size + (selected ? 1 : 0))
          } else {
            drawEventGroup(event)
          }
        }
      }
    }

    const drawSelectedEvent = drawEvent.bind(null, true)
    const drawUnselectedEvent = drawEvent.bind(null, false)

    function refreshEventGraphics (event: TimelineEvent) {
      if (selectedEvent.value === event) {
        drawSelectedEvent(event)
      } else {
        drawUnselectedEvent(event)
      }
    }

    watch(selectedEvent, (event, oldEvent) => {
      drawUnselectedEvent(oldEvent)
      drawSelectedEvent(event)
    })

    // Event selection with keyboard

    function selectPreviousEvent () {
      let index
      if (selectedEvent.value) {
        index = events.indexOf(selectedEvent.value)
      } else {
        index = events.length
      }

      let fullLoops = 0
      do {
        index--
        if (index < 0) {
          index = events.length - 1
          fullLoops++
        }
      } while (isEventIgnored(events[index]) && fullLoops < 2)

      if (events[index]) {
        selectEvent(events[index])
      }
    }

    function selectNextEvent () {
      let index
      if (selectedEvent.value) {
        index = events.indexOf(selectedEvent.value)
      } else {
        index = -1
      }

      let fullLoops = 0
      do {
        index++
        if (index >= events.length) {
          index = 0
          fullLoops++
        }
      } while (isEventIgnored(events[index]) && fullLoops < 2)

      if (events[index]) {
        selectEvent(events[index])
      }
    }

    onKeyUp(event => {
      if (event.key === 'ArrowLeft') {
        selectPreviousEvent()
      } else if (event.key === 'ArrowRight') {
        selectNextEvent()
      }
    })

    // Event Groups

    function drawEventGroup (event: TimelineEvent) {
      if (event.groupG) {
        const drawAsSelected = event === selectedEvent.value && event.layer.groupsOnly

        /** @type {PIXI.Graphics} */
        const g = event.groupG
        g.clear()
        const size = getEventPosition(event.group.lastEvent) - getEventPosition(event.group.firstEvent)
        if (event.layer.groupsOnly) {
          if (drawAsSelected) {
            g.lineStyle(2, boostColor(event.layer.color, darkMode.value))
            g.beginFill(dimColor(event.layer.color, darkMode.value, 30))
          } else {
            g.beginFill(event.layer.color, 0.5)
          }
        } else {
          g.lineStyle(1, dimColor(event.layer.color, darkMode.value))
          g.beginFill(dimColor(event.layer.color, darkMode.value, 25))
        }
        if (event.layer.groupsOnly) {
          g.drawRect(0, -LAYER_SIZE / 2, size - 1, LAYER_SIZE - 1)
        } else {
          // Some adjustements were made on the vertical position and size to snap border pixels to the screen's grid (LoDPI)
          g.drawRoundedRect(-GROUP_SIZE, -GROUP_SIZE + 0.5, size + GROUP_SIZE * 2, GROUP_SIZE * 2 - 1, GROUP_SIZE)
        }

        // Title
        if (event.layer.groupsOnly && event.title && size > 32) {
          let t = event.groupT
          if (!t) {
            t = event.groupT = new PIXI.Text(`${event.title} ${event.subtitle}`, {
              fontSize: 10,
              fill: darkMode.value ? 0xffffff : 0
            })
            t.y = -t.height / 2
            event.container.addChild(t)

            // Mask
            const mask = new PIXI.Graphics()
            event.container.addChild(mask)
            t.mask = mask
          }

          const mask = t.mask as PIXI.Graphics
          mask.clear()
          mask.beginFill(0)
          mask.drawRect(0, -LAYER_SIZE / 2, size - 1, LAYER_SIZE - 1)
        } else if (event.groupT) {
          const mask = event.groupT.mask as PIXI.Graphics
          mask?.destroy()
          event.groupT.destroy()
          event.groupT = null
        }
      }
    }

    // Time cursor

    const { cursorTime } = useCursor()

    let timeCursor: PIXI.Graphics

    onMounted(() => {
      timeCursor = new PIXI.Graphics()
      timeCursor.visible = false
      drawTimeCursor()
      app.stage.addChild(timeCursor)
    })

    function drawTimeCursor () {
      timeCursor.clear()
      timeCursor.lineStyle(1, 0x888888, 0.2)
      timeCursor.moveTo(0.5, 0)
      timeCursor.lineTo(0.5, app.view.height)
    }

    function updateCursorPosition (event: MouseEvent) {
      const { offsetX } = event
      timeCursor.x = offsetX
      timeCursor.visible = true
      cursorTime.value = offsetX / app.view.width * (endTime.value - startTime.value) + startTime.value
    }

    function clearCursor () {
      timeCursor.visible = false
      cursorTime.value = null
    }

    // Time grid

    let timeGrid: PIXI.Graphics

    onMounted(() => {
      timeGrid = new PIXI.Graphics()
      timeGrid.visible = SharedData.timelineTimeGrid
      drawTimeGrid()
      app.stage.addChild(timeGrid)
    })

    function drawTimeGrid () {
      if (!timeGrid.visible || !app.view.width) return

      const size = endTime.value - startTime.value
      const ratio = size / app.view.width
      let timeInterval = 10
      let width = timeInterval / ratio

      if (size <= MIN_CAMERA_SIZE * 3) {
        // Every ms
        timeInterval = 1
        width = timeInterval / ratio
      } else {
        while (width < 20) {
          timeInterval *= 10
          width *= 10
        }
      }

      const offset = startTime.value % timeInterval / ratio

      timeGrid.clear()
      timeGrid.lineStyle(1, 0x888888, 0.075)
      for (let x = -offset; x < app.view.width; x += width) {
        timeGrid.moveTo(x + 0.5, 0)
        timeGrid.lineTo(x + 0.5, app.view.height)
      }
    }

    watch(() => SharedData.timelineTimeGrid, value => {
      timeGrid.visible = value
      if (value) {
        drawTimeGrid()
      }
    })

    // Camera

    let cameraUpdateQueued = false

    function queueCameraUpdate () {
      if (cameraUpdateQueued) return
      cameraUpdateQueued = true
      Vue.nextTick(() => {
        updateCamera()
        cameraUpdateQueued = false
      })
    }

    function updateCamera () {
      horizontalScrollingContainer.x = -(startTime.value - minTime.value) / (endTime.value - startTime.value) * app.view.width
      drawLayerBackgroundEffects()
      drawTimeGrid()
    }

    watch(startTime, () => queueCameraUpdate())
    watch(endTime, () => queueCameraUpdate())

    onMounted(() => {
      queueCameraUpdate()
    })

    function onMouseWheel (event: WheelEvent) {
      const size = endTime.value - startTime.value
      const viewWidth = wrapper.value.offsetWidth

      if (event.ctrlKey || event.metaKey) {
        // Zoom
        // Firefox doesn't block the event https://bugzilla.mozilla.org/show_bug.cgi?id=1632465
        event.preventDefault()

        const centerRatio = event.offsetX / viewWidth
        const center = size * centerRatio + startTime.value

        let newSize = size + event.deltaY / viewWidth * size * 2
        if (newSize < MIN_CAMERA_SIZE) {
          newSize = MIN_CAMERA_SIZE
        }

        let start = center - newSize * centerRatio
        let end = center + newSize * (1 - centerRatio)
        if (start < minTime.value) {
          start = minTime.value
        }
        if (end > maxTime.value) {
          end = maxTime.value
        }
        startTime.value = start
        endTime.value = end
      } else {
        let deltaX = event.deltaX

        if (deltaX === 0 && event.shiftKey && event.deltaY !== 0) {
          // Horitonzal scroll with vertical mouse wheel and shift key
          deltaX = event.deltaY
        }

        if (deltaX !== 0) {
          // Horizontal scroll
          const delta = deltaX / viewWidth * size
          let start = startTime.value += delta
          if (start < minTime.value) {
            start = minTime.value
          } else if (start + size >= maxTime.value) {
            start = maxTime.value - size
          }
          startTime.value = start
          endTime.value = start + size
        } else if (event.deltaY !== 0) {
          // Vertical scroll
          const layersScroller = document.querySelector('[data-scroller="layers"]')
          if (layersScroller) {
            const speed = SharedData.menuStepScrolling ? 1 : LAYER_SIZE * 4
            if (event.deltaY < 0) {
              layersScroller.scrollTop -= speed
            } else {
              layersScroller.scrollTop += speed
            }
          }
        }
      }
    }

    // Vertical scroll

    function updateVScroll () {
      if (verticalScrollingContainer) {
        verticalScrollingContainer.y = -vScroll.value
      }
    }

    watch(vScroll, () => {
      updateVScroll()
    })

    onMounted(() => {
      updateVScroll()
    })

    // Resize

    function onResize () {
      app.view.style.opacity = '0'
      app.queueResize()
      queueEventsUpdate()
      drawLayerBackgroundEffects()
      drawTimeCursor()
      drawTimeGrid()
    }

    // Events

    function onMouseMove (event: MouseEvent) {
      updateLayerHover(event)
      updateCursorPosition(event)
    }

    function onMouseOut () {
      clearLayerHover()
      clearCursor()
    }

    return {
      wrapper,
      onMouseWheel,
      onMouseMove,
      onMouseOut,
      onResize
    }
  }
})
</script>

<template>
  <div
    ref="wrapper"
    class="relative overflow-hidden"
    data-id="timeline-view-wrapper"
    @wheel="onMouseWheel"
    @mousemove="onMouseMove"
    @mouseout="onMouseOut"
  >
    <resize-observer @notify="onResize" />
  </div>
</template>
