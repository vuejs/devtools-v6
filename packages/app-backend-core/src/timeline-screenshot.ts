import { BackendContext } from '@vue-devtools/app-backend-api'
import { ID, ScreenshotOverlayRenderContext } from '@vue/devtools-api'
import { JobQueue } from './util/queue'
import { builtinLayers } from './timeline-builtins'

let overlay: HTMLDivElement
let image: HTMLImageElement
let container: HTMLDivElement

const jobQueue = new JobQueue()

interface Screenshot {
  id: ID
  time: number
  image: string
  events: ID[]
}

export async function showScreenshot (screenshot: Screenshot, ctx: BackendContext) {
  await jobQueue.queue(async () => {
    if (screenshot) {
      if (!container) {
        createElements()
      }

      image.src = screenshot.image

      clearContent()

      const events = screenshot.events.map(id => ctx.timelineEventMap.get(id)).filter(Boolean).map(eventData => ({
        layer: builtinLayers.concat(ctx.timelineLayers).find(layer => layer.id === eventData.layerId),
        event: {
          ...eventData.event,
          layerId: eventData.layerId,
          renderMeta: {}
        }
      }))

      const renderContext: ScreenshotOverlayRenderContext = {
        screenshot,
        events: events.map(({ event }) => event),
        index: 0
      }

      for (let i = 0; i < events.length; i++) {
        const { layer, event } = events[i]
        if (layer.screenshotOverlayRender) {
          renderContext.index = i
          try {
            const result = await layer.screenshotOverlayRender(event, renderContext)
            if (result !== false) {
              if (typeof result === 'string') {
                container.innerHTML += result
              } else {
                container.appendChild(result)
              }
            }
          } catch (e) {
            console.error(e)
          }
        }
      }

      showElement()
    } else {
      hideElement()
    }
  })
}

function createElements () {
  overlay = document.createElement('div')
  overlay.style.position = 'fixed'
  overlay.style.zIndex = '9999999999999'
  overlay.style.pointerEvents = 'none'
  overlay.style.left = '0'
  overlay.style.top = '0'
  overlay.style.width = '100vw'
  overlay.style.height = '100vh'
  overlay.style.backgroundColor = 'rgba(0,0,0,0.5)'
  overlay.style.overflow = 'hidden'

  const imageBox = document.createElement('div')
  imageBox.style.position = 'relative'
  overlay.appendChild(imageBox)

  image = document.createElement('img')
  imageBox.appendChild(image)

  container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '0'
  container.style.top = '0'
  imageBox.appendChild(container)

  const style = document.createElement('style')
  style.innerHTML = '.__vuedevtools_no-scroll { overflow: hidden; }'
  document.head.appendChild(style)
}

function showElement () {
  if (!overlay.parentNode) {
    document.body.appendChild(overlay)
    document.body.classList.add('__vuedevtools_no-scroll')
  }
}

function hideElement () {
  if (overlay && overlay.parentNode) {
    overlay.parentNode.removeChild(overlay)

    document.body.classList.remove('__vuedevtools_no-scroll')

    clearContent()
  }
}

function clearContent () {
  while (container.firstChild) {
    container.removeChild(container.lastChild)
  }
}
