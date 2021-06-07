import { isBrowser } from '@vue-devtools/shared-utils'
import { BackendContext } from '@vue-devtools/app-backend-api'
import { ComponentBounds } from '@vue/devtools-api'
import { JobQueue } from './util/queue'

let overlay: HTMLDivElement
let overlayContent: HTMLDivElement
let currentInstance

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
  overlayContent.style.backgroundColor = 'white'
  overlayContent.style.fontFamily = 'monospace'
  overlayContent.style.fontSize = '11px'
  overlayContent.style.padding = '4px 8px'
  overlayContent.style.borderRadius = '3px'
  overlayContent.style.color = '#333'
  overlayContent.style.textAlign = 'center'
  overlayContent.style.border = 'rgba(65, 184, 131, 0.5) 1px solid'
  overlayContent.style.backgroundClip = 'padding-box'
}

// Use a job queue to preserve highlight/unhighlight calls order
// This prevents "sticky" highlights that are not removed because highlight is async
const jobQueue = new JobQueue()

export async function highlight (instance, ctx: BackendContext) {
  await jobQueue.queue(async () => {
    if (!instance) return

    const bounds = await ctx.api.getComponentBounds(instance)
    if (bounds) {
      createOverlay()

      // Name
      const name = (await ctx.api.getComponentName(instance)) || 'Anonymous'
      const pre = document.createElement('span')
      pre.style.opacity = '0.6'
      pre.innerText = '<'
      const text = document.createElement('span')
      text.style.fontWeight = 'bold'
      text.style.color = '#09ab56'
      text.innerText = name
      const post = document.createElement('span')
      post.style.opacity = '0.6'
      post.innerText = '>'

      // Size
      const size = document.createElement('span')
      size.style.opacity = '0.5'
      size.style.marginLeft = '6px'
      size.appendChild(document.createTextNode((Math.round(bounds.width * 100) / 100).toString()))
      const multiply = document.createElement('span')
      multiply.style.marginLeft = multiply.style.marginRight = '2px'
      multiply.innerText = '×'
      size.appendChild(multiply)
      size.appendChild(document.createTextNode((Math.round(bounds.height * 100) / 100).toString()))

      currentInstance = instance

      await showOverlay(bounds, [pre, text, post, size])
    }

    startUpdateTimer(ctx)
  })
}

export async function unHighlight () {
  await jobQueue.queue(async () => {
    overlay?.parentNode?.removeChild(overlay)
    overlayContent?.parentNode?.removeChild(overlayContent)
    currentInstance = null

    stopUpdateTimer()
  })
}

function showOverlay (bounds: ComponentBounds, children: Node[] = null) {
  if (!isBrowser || !children.length) return

  positionOverlay(bounds)
  document.body.appendChild(overlay)

  overlayContent.innerHTML = ''
  children.forEach(child => overlayContent.appendChild(child))
  document.body.appendChild(overlayContent)

  positionOverlayContent(bounds)
}

function positionOverlay ({ width = 0, height = 0, top = 0, left = 0 }) {
  overlay.style.width = Math.round(width) + 'px'
  overlay.style.height = Math.round(height) + 'px'
  overlay.style.left = Math.round(left) + 'px'
  overlay.style.top = Math.round(top) + 'px'
}

function positionOverlayContent ({ wifth = 0, height = 0, top = 0, left = 0 }) {
  // Content position (prevents overflow)
  const contentWidth = overlayContent.offsetWidth
  const contentHeight = overlayContent.offsetHeight
  let contentLeft = left
  if (contentLeft < 0) {
    contentLeft = 0
  } else if (contentLeft + contentWidth > window.innerWidth) {
    contentLeft = window.innerWidth - contentWidth
  }
  let contentTop = top - contentHeight - 2
  if (contentTop < 0) {
    contentTop = top + height + 2
  }
  if (contentTop < 0) {
    contentTop = 0
  } else if (contentTop + contentHeight > window.innerHeight) {
    contentTop = window.innerHeight - contentHeight
  }
  overlayContent.style.left = ~~contentLeft + 'px'
  overlayContent.style.top = ~~contentTop + 'px'
}

async function updateOverlay (ctx: BackendContext) {
  if (currentInstance) {
    const bounds = await ctx.api.getComponentBounds(currentInstance)
    if (bounds) {
      const sizeEl = overlayContent.children.item(3)
      const widthEl = sizeEl.childNodes[0] as unknown as Text
      widthEl.textContent = (Math.round(bounds.width * 100) / 100).toString()
      const heightEl = sizeEl.childNodes[2] as unknown as Text
      heightEl.textContent = (Math.round(bounds.height * 100) / 100).toString()

      positionOverlay(bounds)
      positionOverlayContent(bounds)
    }
  }
}

let updateTimer

function startUpdateTimer (ctx: BackendContext) {
  stopUpdateTimer()
  updateTimer = setInterval(() => {
    jobQueue.queue(async () => {
      await updateOverlay(ctx)
    })
  }, 1000 / 30) // 30fps
}

function stopUpdateTimer () {
  clearInterval(updateTimer)
}
