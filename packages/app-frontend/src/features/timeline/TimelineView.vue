<script>
import * as PIXI from 'pixi.js'
import { install as installUnsafeEval } from '@pixi/unsafe-eval'
import { ref, onMounted, onUnmounted, watch, watchEffect } from '@vue/composition-api'
import { useLayers, useTime, useSelectedEvent, onTimelineReset, onEventAdd } from '.'
import Vue from 'vue'
import { useApps } from '../apps'
import { onKeyUp } from '@front/util/keyboard'
import { useDarkMode } from '@front/util/theme'

installUnsafeEval(PIXI)

export default {
  setup () {
    const wrapper = ref(null)

    const { currentAppId } = useApps()
    const { startTime, endTime, minTime, maxTime } = useTime()
    const { darkMode } = useDarkMode()

    // Reset

    const resetCbs = []

    function onReset (cb) {
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

    /** @type {Application} */
    let app

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
    })

    onUnmounted(() => {
      app.destroy()
    })

    function updateBackground () {
      if (darkMode.value) {
        app && (app.renderer.backgroundColor = 0x0A1015)
      } else {
        app && (app.renderer.backgroundColor = 0xffffff)
      }
    }

    watchEffect(() => {
      updateBackground()
    })

    // Layers

    const { layers, vScroll, hoverLayerId } = useLayers()

    /** @type {Container[]} */
    let layerContainers = []
    let layersMap = {}

    function initLayers () {
      let y = 0
      for (const layer of layers.value) {
        const container = new PIXI.Container()
        container.y = y
        y += 32
        app.stage.addChild(container)
        // allow z-index sorting
        container.sortableChildren = true
        layerContainers.push(container)
        layersMap[layer.id] = {
          layer,
          container
        }
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

    watch(layers, () => resetLayers())

    // Layer hover

    /** @type {import('pixi.js').Graphics} */
    let layerHoverEffect

    onMounted(() => {
      layerHoverEffect = new PIXI.Graphics()
      layerHoverEffect.alpha = 0.1
      layerHoverEffect.visible = false
      app.stage.addChild(layerHoverEffect)
    })

    function drawLayerHoverEffect () {
      if (!layerHoverEffect) return

      if (hoverLayerId.value) {
        const { layer } = layersMap[hoverLayerId.value]
        layerHoverEffect.clear()
        layerHoverEffect.beginFill(layer.color)
        layerHoverEffect.drawRect(0, 0, app.view.width, 32)
        layerHoverEffect.x = -app.stage.x
        layerHoverEffect.y = layers.value.indexOf(layer) * 32
        layerHoverEffect.visible = true
      } else {
        layerHoverEffect.visible = false
      }
    }

    watch(hoverLayerId, () => {
      drawLayerHoverEffect()
    })

    function onMouseMove (event) {
      const { offsetY } = event
      const layerIndex = Math.floor((offsetY + vScroll.value) / 32)
      if (layerIndex < layers.value.length) {
        hoverLayerId.value = layers.value[layerIndex].id
      } else {
        hoverLayerId.value = null
      }
    }

    // Events

    const { selectedEvent } = useSelectedEvent()

    let events = []

    function updateEventPosition (event, g) {
      g.x = (event.time - minTime.value) / (endTime.value - startTime.value) * app.view.width
    }

    function addEvent (event, container) {
      // Graphics
      const g = new PIXI.Graphics()
      updateEventPosition(event, g)
      g.y = 16
      event.g = g
      setTimeout(() => {
        if (selectedEvent.value === event) {
          drawSelectedEvent(event)
        } else {
          drawUnselectedEvent(event)
        }
      }, 5)
      container.addChild(g)

      events.push(event)

      return event
    }

    function initEvents () {
      for (const k in layersMap) {
        const { layer, container } = layersMap[k]
        for (const event of layer.displayedEvents) {
          addEvent(event, container)
        }
      }
    }

    onMounted(() => {
      initEvents()
    })

    function resetEvents () {
      for (const e of events) {
        e.g.destroy()
        e.g = null
      }
      events = []
      initEvents()
    }

    onEventAdd(event => {
      if (event.stackParent) return
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
      for (const event of events) {
        updateEventPosition(event, event.g)
      }
    }

    watch(startTime, () => queueEventsUpdate())
    watch(endTime, () => queueEventsUpdate())
    watch(minTime, () => queueEventsUpdate())

    // Event selection

    onMounted(() => {
      app.stage.addListener('click', event => {
        let choice
        let distance = Number.POSITIVE_INFINITY
        for (const e of events) {
          const globalPosition = e.g.getGlobalPosition()
          const d = Math.abs(globalPosition.x - event.data.global.x) + Math.abs(globalPosition.y - event.data.global.y)

          if (!choice || d < distance) {
            choice = e
            distance = d
          }
        }
        selectedEvent.value = choice
      })
    })

    function drawEvent (size, event) {
      if (event) {
        let color = event.layer.color
        for (const subEvent of event.stackedEvents) {
          if (subEvent.logType === 'error') {
            color = 0xE53E3E
            break
          } else if (subEvent.logType === 'warning') {
            color = 0xECC94B
          }
        }

        if (event.g) {
          event.g.zIndex = size
          event.g.clear()
          event.g.beginFill(color)
          event.g.drawCircle(0, 0, size)
        }
      }
    }

    const drawSelectedEvent = drawEvent.bind(null, 7)
    const drawUnselectedEvent = drawEvent.bind(null, 4)

    watch(selectedEvent, (event, oldEvent) => {
      drawUnselectedEvent(oldEvent)
      drawSelectedEvent(event)
    })

    // Event selection with keyboard

    onKeyUp(event => {
      if (event.key === 'ArrowLeft') {
        let index
        if (selectedEvent.value) {
          index = events.indexOf(selectedEvent.value) - 1
          if (index < 0) {
            index = events.length - 1
          }
        } else {
          index = events.length - 1
        }
        selectedEvent.value = events[index]
      } else if (event.key === 'ArrowRight') {
        let index
        if (selectedEvent.value) {
          index = events.indexOf(selectedEvent.value) + 1
          if (index >= events.length) {
            index = 0
          }
        } else {
          index = 0
        }
        selectedEvent.value = events[index]
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
      app.stage.x = -(startTime.value - minTime.value) / (endTime.value - startTime.value) * app.view.width
      drawLayerHoverEffect()
    }

    watch(startTime, () => queueCameraUpdate())
    watch(endTime, () => queueCameraUpdate())

    /**
     * @param {MouseWheelEvent} event
     */
    function onMouseWheel (event) {
      const size = endTime.value - startTime.value
      const viewWidth = wrapper.value.offsetWidth

      if (event.ctrlKey || event.metaKey) {
        // Zoom
        event.preventDefault()

        const centerRatio = event.offsetX / viewWidth
        const center = size * centerRatio + startTime.value

        let newSize = size + event.deltaY / viewWidth * size * 2
        if (newSize < 100) {
          newSize = 100
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
        }
      }
    }

    // Vertical scroll

    function updateVScroll () {
      if (app) {
        app.stage.y = -vScroll.value
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
      app.queueResize()
      queueEventsUpdate()
      drawLayerHoverEffect()
    }

    return {
      wrapper,
      onMouseWheel,
      onMouseMove,
      hoverLayerId,
      onResize
    }
  }
}
</script>

<template>
  <div
    ref="wrapper"
    class="relative overflow-hidden"
    @mousewheel="onMouseWheel"
    @mousemove="onMouseMove"
    @mouseout="hoverLayerId = null"
  >
    <resize-observer @notify="onResize" />
  </div>
</template>
