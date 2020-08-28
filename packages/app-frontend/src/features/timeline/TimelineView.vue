<script>
import { Application, Container, Graphics, Rectangle } from 'pixi.js'
import { ref, onMounted, onUnmounted, watch } from '@vue/composition-api'
import { useLayers, useTime, useSelectedEvent, onTimelineReset, onEventAdd } from '.'
import Vue from 'vue'
import { useApps } from '../apps'

export default {
  setup () {
    const wrapper = ref(null)

    const { currentAppId } = useApps()

    // Reset

    const resetCbs = []

    function onReset (cb) {
      resetCbs.push(cb)
    }

    function reset () {
      clearEventSelection()
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
      app = new Application({
        resizeTo: wrapper.value,
        backgroundColor: 0xffffff,
        antialias: true,
        autoDensity: true
      })
      wrapper.value.appendChild(app.view)
    })

    onUnmounted(() => {
      app.destroy()
    })

    // Layers

    const { layers } = useLayers()
    /** @type {Container[]} */
    let layerContainers = []
    let layersMap = {}

    function initLayers () {
      let y = 0
      for (const layer of layers.value) {
        const container = new Container()
        container.y = y
        y += 32
        app.stage.addChild(container)
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

    onReset(() => {
      for (const container of layerContainers) {
        container.destroy()
      }
      layerContainers = []
      layersMap = {}
      initLayers()
    })

    // Events

    const { startTime, endTime, minTime } = useTime()
    const { selectedEvent } = useSelectedEvent()

    let events = []

    function updateEventPosition (event, g) {
      g.x = (event.time - minTime.value) / (endTime.value - startTime.value) * app.view.width
    }

    function addEvent (event, container) {
      // Graphics
      const g = new Graphics()
      g.beginFill(event.layer.color)
      g.drawCircle(0, 0, 4)
      updateEventPosition(event, g)
      g.y = 16
      event.g = g
      container.addChild(g)

      events.push(event)

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

    onReset(() => {
      for (const e of events) {
        e.g.destroy()
      }
      events = []
      initEvents()
    })

    onEventAdd(event => {
      if (event.stackParent) return
      if (event.appId !== 'all' && event.appId !== currentAppId.value) return

      const { container } = layersMap[event.layer.id]
      addEvent(event, container)
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
      app.stage.interactive = true
      app.stage.hitArea = new Rectangle(0, 0, 100000, 100000)
      app.stage.addListener('click', event => {
        clearEventSelection()

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

        // Update graphics
        if (choice) {
          const g = choice.g
          g.clear()
          g.beginFill(choice.layer.color)
          g.drawCircle(0, 0, 7)
        }
      })
    })

    function clearEventSelection () {
      if (selectedEvent.value) {
        const g = selectedEvent.value.g
        g.clear()
        g.beginFill(selectedEvent.value.layer.color)
        g.drawCircle(0, 0, 4)
      }
      selectedEvent.value = null
    }

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
    }

    watch(startTime, () => queueCameraUpdate())
    watch(endTime, () => queueCameraUpdate())

    // Resize

    function onResize () {
      app.queueResize()
      queueEventsUpdate()
    }

    return {
      wrapper,
      onResize
    }
  }
}
</script>

<template>
  <div
    ref="wrapper"
    class="relative overflow-hidden"
  >
    <resize-observer @notify="onResize" />
  </div>
</template>
