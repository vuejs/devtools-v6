<script lang="ts">
import * as PIXI from 'pixi.js-legacy'
import { install as installUnsafeEval } from '@pixi/unsafe-eval'
import {
  ref,
  onMounted,
  onUnmounted,
  watch,
  watchEffect,
  defineComponent,
} from '@vue/composition-api'
import Vue from 'vue'
import { SharedData } from '@vue-devtools/shared-utils'
import {
  useLayers,
  useTime,
  useSelectedEvent,
  selectEvent,
  onTimelineReset,
  onEventAdd,
  useCursor,
  Layer,
  TimelineEvent,
  useMarkers,
  TimelineMarker,
  getGroupsAroundPosition,
} from './composable'
import { useApps } from '@front/features/apps'
import { onKeyUp } from '@front/util/keyboard'
import { useDarkMode } from '@front/util/theme'
import { dimColor, boostColor } from '@front/util/color'
import { formatTime } from '@front/util/format'
import { Queue } from '@front/util/queue'
import { nonReactive } from '@front/util/reactivity'

PIXI.settings.ROUND_PIXELS = true
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

PIXI.BitmapFont.from('Roboto Mono', {
  fontFamily: 'Roboto Mono',
  fontSize: 9,
})

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

    // Optimize for read in loops
    const nonReactiveTime = {
      startTime: nonReactive(startTime),
      endTime: nonReactive(endTime),
      minTime: nonReactive(minTime),
    }

    function getTimePosition (time: number) {
      return (time - nonReactiveTime.minTime.value) / (nonReactiveTime.endTime.value - nonReactiveTime.startTime.value) * app.view.width
    }

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

    let mainRenderTexture: PIXI.RenderTexture
    let mainRenderContainer: PIXI.Container

    let verticalScrollingContainer: PIXI.Container
    let horizontalScrollingContainer: PIXI.Container

    onMounted(() => {
      app = new PIXI.Application({
        resizeTo: wrapper.value,
        antialias: true,
        autoDensity: true,
        resolution: window.devicePixelRatio,
      })
      app.stage.interactive = true
      app.stage.hitArea = new PIXI.Rectangle(0, 0, 100000, 100000)
      updateBackground()
      wrapper.value.appendChild(app.view)
      app.view.style.opacity = '0'
      app.renderer.on('postrender', () => {
        app.view.style.opacity = '1'
      })

      mainRenderTexture = PIXI.RenderTexture.create({
        width: app.view.width,
        height: app.view.height,
        resolution: window.devicePixelRatio,
      })
      const mainRenderSprite = new PIXI.Sprite(mainRenderTexture)
      app.stage.addChild(mainRenderSprite)

      mainRenderContainer = new PIXI.Container()

      verticalScrollingContainer = new PIXI.Container()
      mainRenderContainer.addChild(verticalScrollingContainer)

      horizontalScrollingContainer = new PIXI.Container()
      verticalScrollingContainer.addChild(horizontalScrollingContainer)
    })

    let drawScheduled = false

    function draw () {
      if (!drawScheduled) {
        drawScheduled = true
        Vue.nextTick(() => {
          app.renderer.render(mainRenderContainer, {
            renderTexture: mainRenderTexture,
          })
          drawScheduled = false
        })
      }
    }

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

    // Markers

    const { currentAppMarkers } = useMarkers()

    let markerContainer: PIXI.Graphics

    onMounted(() => {
      markerContainer = new PIXI.Graphics()
      app.stage.addChild(markerContainer)
      drawMarkers()
    })

    function drawMarkers () {
      markerContainer.clear()
      for (const marker of currentAppMarkers.value) {
        markerContainer.lineStyle(1, marker.color, 0.5, 0, true)
        const x = getTimePosition(marker.time)
        marker.x = x
        markerContainer.moveTo(x, 0)
        markerContainer.lineTo(x, app.view.height)
      }
      markerContainer.x = horizontalScrollingContainer.x
    }

    watch(currentAppMarkers, () => {
      if (markerContainer) {
        drawMarkers()
      }
    })

    function getMarkerAtPosition (targetX: number): TimelineMarker | null {
      let choice: TimelineMarker = null
      let dist: number

      for (const marker of currentAppMarkers.value) {
        const globalX = marker.x + markerContainer.x
        const currentDist = Math.abs(targetX - globalX)
        if (currentDist <= 20 && (currentDist < dist || !choice)) {
          dist = currentDist
          choice = marker
        }
      }

      return choice
    }

    // Layers

    const {
      layers,
      vScroll,
      hoverLayerId,
      selectedLayer,
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
          container,
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
          alpha: 1,
        },
        {
          id: hoverLayerId.value !== selectedLayer.value?.id ? selectedLayer.value?.id : null,
          alpha: 0.5,
        },
      ].filter(({ id }) => id != null)

      if (layerIds.length) {
        layerHoverEffect.clear()
        layerIds.forEach(({ id, alpha }) => drawLayerBackground(id, alpha))
        layerHoverEffect.visible = true
      } else {
        layerHoverEffect.visible = false
      }
      draw()
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

    const updateEventPositionQueue = new Queue<TimelineEvent>()
    const updateEventVerticalPositionQueue = new Queue<TimelineEvent>()
    let eventPositionUpdateInProgress = false
    let eventVerticalPositionUpdateInProgress = false

    function queueEventPositionUpdate (events: TimelineEvent[], force = false) {
      for (const event of events) {
        if (!event.container) continue

        event.forcePositionUpdate = force

        updateEventPositionQueue.add(event)
      }

      // If not running an update, start one
      if (!eventPositionUpdateInProgress) {
        eventPositionUpdateInProgress = true
        Vue.nextTick(() => {
          runEventPositionUpdate()
          eventPositionUpdateInProgress = false
        })
      }
    }

    function runEventPositionUpdate () {
      let event: TimelineEvent
      while ((event = updateEventPositionQueue.shift())) {
        // Ignored
        const ignored = isEventIgnored(event)
        event.container.visible = !ignored
        if (ignored) continue

        // Update horizontal position immediately
        event.container.x = getTimePosition(event.time)

        // Ignore additional updates to flamechart
        if (!event.forcePositionUpdate && event.layer.groupsOnly) continue

        // Queue vertical position compute
        updateEventVerticalPositionQueue.add(event)
      }

      // If not running an update, start one
      if (!eventVerticalPositionUpdateInProgress) {
        eventVerticalPositionUpdateInProgress = true
        Vue.nextTick(() => {
          runEventVerticalPositionUpdate()
          eventVerticalPositionUpdateInProgress = false
        })
      }
    }

    function runEventVerticalPositionUpdate () {
      let event: TimelineEvent
      while ((event = updateEventVerticalPositionQueue.shift())) {
        computeEventVerticalPosition(event)
      }
      draw()
    }

    function isEventIgnored (event: TimelineEvent) {
      return event.layer.ignoreNoDurationGroups && event.group && event.group.duration <= 0
    }

    function computeEventVerticalPosition (event: TimelineEvent) {
      let y = 0
      if (event.group && event !== event.group.firstEvent) {
        // If the event is inside a group, just use the group position
        y = event.group.y
      } else {
        const firstEvent = event.group ? event.group.firstEvent : event
        const lastEvent = event.group ? event.group.lastEvent : event

        // Collision offset for non-flamecharts
        const offset = event.layer.groupsOnly ? 0 : 12
        // For flamechart allow 1-pixel overlap at the end of a group
        const lastOffset = event.layer.groupsOnly && event.group?.duration > 0 ? -1 : 0
        // Flamechart uses time instead of pixel position
        const getPos = event.layer.groupsOnly ? (time: number) => time : getTimePosition

        const firstPos = getPos(firstEvent.time)
        const lastPos = event.group ? getPos(lastEvent.time) : firstPos

        // Check for 'collision' with other event groups
        const otherGroups = event.layer.groupsOnly ? getGroupsAroundPosition(event.layer, firstEvent.time, lastEvent.time) : event.layer.groups
        const l = otherGroups.length
        let checkAgain = true
        while (checkAgain) {
          checkAgain = false
          for (let i = 0; i < l; i++) {
            const otherGroup = otherGroups[i]

            if (
              // Different group
              (
                !event.group ||
                event.group !== otherGroup
              ) &&
              // Same row
              otherGroup.y === y
            ) {
              const otherGroupFirstPos = getPos(otherGroup.firstEvent.time)
              const otherGroupLastPos = getPos(otherGroup.lastEvent.time)

              // First position is inside other group
              const firstEventIntersection = (
                firstPos >= otherGroupFirstPos - offset &&
                firstPos <= otherGroupLastPos + offset + lastOffset
              )

              if (firstEventIntersection || (
                // Additional checks if group
                event.group && (
                  (
                    // Last position is inside other group
                    lastPos >= otherGroupFirstPos - offset - lastOffset &&
                    lastPos <= otherGroupLastPos + offset
                  ) || (
                    // Other group is inside current group
                    firstPos < otherGroupFirstPos - offset &&
                    lastPos > otherGroupLastPos + offset
                  )
                )
              )) {
                // Collision!
                if (event.group && event.group.duration > otherGroup.duration && firstEvent.time <= otherGroup.firstEvent.time) {
                  // Invert positions because current group has higher priority
                  if (!updateEventVerticalPositionQueue.has(otherGroup.firstEvent)) {
                    queueEventPositionUpdate([otherGroup.firstEvent], event.layer.groupsOnly)
                  }
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
    }

    function addEvent (event: TimelineEvent, layerContainer: PIXI.Container) {
      // Container
      let eventContainer: PIXI.Container

      if (!event.layer.groupsOnly || (event.group?.firstEvent === event)) {
        eventContainer = new PIXI.Container()
        Object.defineProperty(event, 'container', {
          value: eventContainer,
          writable: true,
          configurable: false,
        })
        layerContainer.addChild(eventContainer)
      }

      // Group graphics
      if (event.group) {
        if (event.group.firstEvent === event) {
          const groupG = new PIXI.Graphics()
          Object.defineProperty(event, 'groupG', {
            value: groupG,
            writable: true,
            configurable: false,
          })
          Object.defineProperty(event, 'groupT', {
            value: null,
            writable: true,
            configurable: false,
          })
          Object.defineProperty(event, 'groupText', {
            value: null,
            writable: true,
            configurable: false,
          })
          eventContainer.addChild(groupG)
          event.group.oldSize = null
          event.group.oldSelected = null
          drawEventGroup(event)
        } else if (event.group.lastEvent === event) {
          drawEventGroup(event.group.firstEvent)
          // We need to check for collisions again
          Vue.nextTick(() => queueEventsUpdate())
        }
      }

      // Graphics
      if (eventContainer) {
        const g = new PIXI.Graphics()
        Object.defineProperty(event, 'g', {
          value: g,
          writable: true,
          configurable: false,
        })
        eventContainer.addChild(g)
      }

      events.push(event)

      refreshEventGraphics(event)
      if (event.container) {
        queueEventPositionUpdate([event], true)
      } else {
        queueEventPositionUpdate([event.group.firstEvent], true)
      }

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
        e.g?.destroy()
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

        e.container?.destroy()
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
        if (!layer.groupsOnly) {
          layer.height = 1
        }
      }
      updateLayerPositions()
      queueEventPositionUpdate(events)
      for (const event of events) {
        if (event.groupG) {
          drawEventGroup(event)
        }
      }
      draw()
    }

    watch(startTime, () => queueEventsUpdate())
    watch(endTime, () => queueEventsUpdate())
    watch(minTime, () => queueEventsUpdate())

    // Event selection

    function getEventAtPosition (targetX: number, targetY: number): TimelineEvent | null {
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

              if ((!choice || d < distance) && d < 200) {
                choice = e
                distance = d
              }
            }
          }
          break
        }
      }

      return choice
    }

    onMounted(() => {
      app.stage.addListener('click', event => {
        if (cameraDragging) return
        const choice = getEventAtPosition(event.data.global.x, event.data.global.y)
        if (choice) {
          selectEvent(choice)
        }
      })
    })

    function drawEvent (selected: boolean, event: TimelineEvent) {
      if (event?.container) {
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

    // Event tooltip

    let eventTooltip: PIXI.Container
    let eventTooltipTitle: PIXI.Text
    let eventTooltipText: PIXI.Text
    let eventTooltipGraphics: PIXI.Graphics
    let hoverEvent: TimelineEvent

    onMounted(() => {
      eventTooltip = new PIXI.Container()
      eventTooltip.visible = false
      app.stage.addChild(eventTooltip)

      eventTooltipGraphics = new PIXI.Graphics()
      eventTooltip.addChild(eventTooltipGraphics)

      eventTooltipTitle = new PIXI.Text('', {
        fontSize: 12,
        fill: 0x000000,
        fontWeight: 'bold',
      })
      eventTooltipTitle.x = 4
      eventTooltipTitle.y = 4
      eventTooltip.addChild(eventTooltipTitle)

      eventTooltipText = new PIXI.Text('', {
        fontSize: 12,
        fill: 0x000000,
      })
      eventTooltipText.alpha = 0.7
      eventTooltipText.x = 4
      eventTooltipText.y = eventTooltipTitle.height + 4
      eventTooltip.addChild(eventTooltipText)

      app.stage.addListener('mousemove', mouseEvent => {
        const text: string[] = []

        // Event tooltip
        const event = getEventAtPosition(mouseEvent.data.global.x, mouseEvent.data.global.y)
        if (event) {
          text.push(event.title ?? 'Event')
          if (event.subtitle) {
            text.push(event.subtitle)
          }
          text.push(formatTime(event.time, 'ms'))

          if (event.group) {
            text.push(`Group: ${event.group.duration}ms (${event.group.events.length} event${event.group.events.length > 1 ? 's' : ''})`)
          }

          if (event?.container) {
            event.container.alpha = 0.5
          }
        } else {
          // Marker tooltip
          const marker = getMarkerAtPosition(mouseEvent.data.global.x)
          if (marker) {
            text.push(marker.label)
            text.push(formatTime(marker.time, 'ms'))
            text.push('(marker)')
          }
        }
        if (event !== hoverEvent) {
          if (hoverEvent?.container) {
            hoverEvent.container.alpha = 1
          }
          draw()
        }
        hoverEvent = event

        if (text.length) {
          // Draw tooltip
          eventTooltipTitle.text = text[0]
          eventTooltipText.text = text.slice(1).join('\n')

          eventTooltipGraphics.clear()
          eventTooltipGraphics.beginFill(0xffffff)
          eventTooltipGraphics.lineStyle(1, 0x000000, 0.2, 1)
          const width = Math.max(eventTooltipTitle.width, eventTooltipText.width) + 8
          const height = eventTooltipTitle.height + (text.length > 1 ? eventTooltipText.height : 0) + 8
          eventTooltipGraphics.drawRoundedRect(0, 0, width, height, 4)

          eventTooltip.x = mouseEvent.data.global.x + 12
          if (eventTooltip.x + eventTooltip.width > app.renderer.width) {
            eventTooltip.x = mouseEvent.data.global.x - eventTooltip.width - 12
          }
          eventTooltip.y = mouseEvent.data.global.y + 12
          if (eventTooltip.y + eventTooltip.height > app.renderer.height) {
            eventTooltip.y = mouseEvent.data.global.y - eventTooltip.height - 12
          }
          eventTooltip.visible = true
        } else {
          if (hoverEvent?.container) {
            hoverEvent.container.alpha = 1
          }
          eventTooltip.visible = false
        }
      })
    })

    // Event Groups

    function drawEventGroup (event: TimelineEvent) {
      if (event.groupG) {
        const drawAsSelected = event === selectedEvent.value && event.layer.groupsOnly

        /** @type {PIXI.Graphics} */
        const g = event.groupG
        const size = getTimePosition(event.group.lastEvent.time) - getTimePosition(event.group.firstEvent.time)
        if (size !== event.group.oldSize || drawAsSelected !== event.group.oldSelected) {
          g.clear()
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
        }

        // Title
        if (event.layer.groupsOnly && event.title && size > 32) {
          let t = event.groupT
          let text = event.groupText
          if (!t) {
            text = `${SharedData.debugInfo ? `${event.id} ` : ''}${event.title} ${event.subtitle}`
            t = event.groupT = new PIXI.BitmapText('', {
              fontName: 'Roboto Mono',
              tint: darkMode.value ? 0xffffff : 0,
            })
            t.x = 1
            t.y = Math.round(-t.height / 2)
            t.dirty = false
            event.groupText = text
            event.container.addChild(t)
          }
          t.text = text.slice(0, Math.floor((size - 1) / 6))
        } else if (event.groupT) {
          event.groupT.destroy()
          event.groupT = null
        }

        event.group.oldSize = size
        event.group.oldSelected = drawAsSelected
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
      drawMarkers()
      draw()
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
        draw()
      }
    }

    watch(vScroll, () => {
      updateVScroll()
    })

    onMounted(() => {
      updateVScroll()
    })

    // Camera dragging

    let cameraDragging = false
    let startDragX: number
    let startDragY: number
    let startDragTime: number
    let startDragScrollTop: number

    onMounted(() => {
      const layersScroller = document.querySelector('[data-scroller="layers"]')

      const onMouseMove = (event) => {
        const { x, y } = event.data.global
        if (!cameraDragging && (Math.abs(x - startDragX) > 5 || Math.abs(y - startDragY) > 5)) {
          cameraDragging = true
        }

        if (cameraDragging) {
          const deltaX = startDragX - x
          const deltaY = startDragY - y

          // Horizontal
          const size = endTime.value - startTime.value
          const viewWidth = wrapper.value.offsetWidth
          const delta = deltaX / viewWidth * size
          let start = startTime.value = startDragTime + delta
          if (start < minTime.value) {
            start = minTime.value
          } else if (start + size >= maxTime.value) {
            start = maxTime.value - size
          }
          startTime.value = start
          endTime.value = start + size

          // Vertical
          layersScroller.scrollTop = startDragScrollTop + deltaY
        }
      }

      app.stage.addListener('mousedown', (event) => {
        const { x, y } = event.data.global
        startDragX = x
        startDragY = y
        startDragTime = startTime.value
        startDragScrollTop = layersScroller.scrollTop
        app.stage.addListener('mousemove', onMouseMove)
      })

      window.addEventListener('mouseup', () => {
        cameraDragging = false
        app.stage.removeListener('mousemove', onMouseMove)
      })
    })

    // Resize

    function onResize () {
      app.view.style.opacity = '0'
      // @ts-expect-error PIXI type is missing queueResize
      app.queueResize()
      mainRenderTexture.resize(app.view.width, app.view.height)
      queueEventsUpdate()
      drawLayerBackgroundEffects()
      drawTimeCursor()
      drawTimeGrid()
      draw()
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
      onResize,
    }
  },
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
