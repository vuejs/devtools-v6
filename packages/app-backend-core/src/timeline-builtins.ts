import { TimelineLayerOptions } from '@vue/devtools-api'

export const builtinLayers: TimelineLayerOptions[] = [
  {
    id: 'mouse',
    label: 'Mouse',
    color: 0xA451AF,
    screenshotOverlayRender (event, { events }) {
      const samePositionEvent = events.find(e => e !== event && e.renderMeta.textEl && e.data.x === event.data.x && e.data.y === event.data.y)
      if (samePositionEvent) {
        const text = document.createElement('div')
        text.innerText = event.data.type
        samePositionEvent.renderMeta.textEl.appendChild(text)
        return false
      }

      const div = document.createElement('div')
      div.style.position = 'absolute'
      div.style.left = `${event.data.x - 4}px`
      div.style.top = `${event.data.y - 4}px`
      div.style.width = '8px'
      div.style.height = '8px'
      div.style.borderRadius = '100%'
      div.style.backgroundColor = 'rgba(164, 81, 175, 0.5)'

      const text = document.createElement('div')
      text.innerText = event.data.type
      text.style.color = '#541e5b'
      text.style.fontFamily = 'monospace'
      text.style.fontSize = '9px'
      text.style.position = 'absolute'
      text.style.left = '10px'
      text.style.top = '10px'
      text.style.padding = '1px'
      text.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
      text.style.borderRadius = '3px'
      div.appendChild(text)

      event.renderMeta.textEl = text

      return div
    }
  },
  {
    id: 'keyboard',
    label: 'Keyboard',
    color: 0x8151AF
  },
  {
    id: 'component-event',
    label: 'Component events',
    color: 0x41B883,
    screenshotOverlayRender: (event, { events }) => {
      if (!event.meta.bounds || events.some(e => e !== event && e.layerId === event.layerId && e.renderMeta.drawn && (e.meta.componentId === event.meta.componentId || (
        e.meta.bounds.left === event.meta.bounds.left &&
        e.meta.bounds.top === event.meta.bounds.top &&
        e.meta.bounds.width === event.meta.bounds.width &&
        e.meta.bounds.height === event.meta.bounds.height
      )))) {
        return false
      }

      const div = document.createElement('div')
      div.style.position = 'absolute'
      div.style.left = `${event.meta.bounds.left - 4}px`
      div.style.top = `${event.meta.bounds.top - 4}px`
      div.style.width = `${event.meta.bounds.width}px`
      div.style.height = `${event.meta.bounds.height}px`
      div.style.borderRadius = '8px'
      div.style.borderStyle = 'solid'
      div.style.borderWidth = '4px'
      div.style.borderColor = 'rgba(65, 184, 131, 0.5)'
      div.style.textAlign = 'center'
      div.style.display = 'flex'
      div.style.alignItems = 'center'
      div.style.justifyContent = 'center'
      div.style.overflow = 'hidden'

      const text = document.createElement('div')
      text.style.color = '#267753'
      text.style.fontFamily = 'monospace'
      text.style.fontSize = '9px'
      text.style.padding = '1px'
      text.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'
      text.style.borderRadius = '3px'
      text.innerText = event.data.event
      div.appendChild(text)

      event.renderMeta.drawn = true

      return div
    }
  },
  {
    id: 'performance',
    label: 'Performance',
    color: 0x41b86a,
    groupsOnly: true,
    skipScreenshots: true,
    ignoreNoDurationGroups: true
  }
]
