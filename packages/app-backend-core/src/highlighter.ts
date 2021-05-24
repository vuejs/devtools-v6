import { isBrowser } from '@vue-devtools/shared-utils'
import { BackendContext } from '@vue-devtools/app-backend-api'
import { JobQueue } from './util/queue'

let overlay: HTMLDivElement
let overlayContent: HTMLDivElement

function createOverlay () {
  if (overlay || !isBrowser) return
  overlay = document.createElement('div')
  overlay.style.backgroundColor = 'rgba(65, 184, 131, 0.35)'
  overlay.style.position = 'fixed'
  overlay.style.zIndex = '99999999999998'
  overlay.style.pointerEvents = 'none'
  overlay.style.borderRadius = '3px'
  overlayContent = document.createElement('div')
  overlayContent.style.position = 'fixed'
  overlayContent.style.zIndex = '99999999999999'
  overlayContent.style.pointerEvents = 'none'
  overlayContent.style.backgroundColor = 'rgba(65, 184, 131, 0.9)'
  overlayContent.style.fontFamily = 'monospace'
  overlayContent.style.fontSize = '11px'
  overlayContent.style.padding = '2px 3px'
  overlayContent.style.borderRadius = '3px'
  overlayContent.style.color = 'white'
  overlayContent.style.textAlign = 'center'
}

// Use a job queue to preserve highlight/unhighlight calls order
// This prevents "sticky" highlights that are not removed because highlight is async
const jobQueue = new JobQueue()

export async function highlight (instance, ctx: BackendContext) {
  await jobQueue.queue(async () => {
    if (!instance) return

    const bounds = await ctx.api.getComponentBounds(instance)
    if (bounds) {
      const name = (await ctx.api.getComponentName(instance)) || 'Anonymous'
      createOverlay()
      const pre = document.createElement('span')
      pre.style.opacity = '0.6'
      pre.innerText = '<'
      const text = document.createTextNode(name)
      const post = document.createElement('span')
      post.style.opacity = '0.6'
      post.innerText = '>'
      await showOverlay(bounds, [pre, text, post])
    }
  })
}

export async function unHighlight () {
  await jobQueue.queue(async () => {
    overlay?.parentNode?.removeChild(overlay)
    overlayContent?.parentNode?.removeChild(overlayContent)
  })
}

function showOverlay ({ width = 0, height = 0, top = 0, left = 0 }, children: Node[] = []) {
  if (!isBrowser || !children.length) return

  overlay.style.width = ~~width + 'px'
  overlay.style.height = ~~height + 'px'
  overlay.style.left = ~~left + 'px'
  overlay.style.top = ~~top + 'px'
  document.body.appendChild(overlay)

  overlayContent.innerHTML = ''
  children.forEach(child => overlayContent.appendChild(child))
  document.body.appendChild(overlayContent)

  // Content position (prevents overflow)
  const contentWidth = overlayContent.offsetWidth
  const contentHeight = overlayContent.offsetHeight
  let contentLeft = left + (width - contentWidth) / 2
  if (contentLeft < 0) {
    contentLeft = 0
  } else if (contentLeft + contentWidth > window.innerWidth) {
    contentLeft = window.innerWidth - contentWidth
  }
  let contentTop = top + (height - contentHeight) / 2
  if (contentTop < 0) {
    contentTop = 0
  } else if (contentTop + contentHeight > window.innerHeight) {
    contentTop = window.innerHeight - contentHeight
  }
  overlayContent.style.left = ~~contentLeft + 'px'
  overlayContent.style.top = ~~contentTop + 'px'
}
