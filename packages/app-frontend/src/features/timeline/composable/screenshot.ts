import SharedData from '@utils/shared-data'
import { BridgeEvents } from '@vue-devtools/shared-utils'
import { useApps } from '@front/features/apps'
import { useBridge } from '@front/features/bridge'
import { EventScreenshot, screenshots, TimelineEvent } from './store'

let nextScreenshotId = 0

export async function takeScreenshot (event: TimelineEvent) {
  if (!SharedData.timelineScreenshots || event.layer.skipScreenshots) return

  const time = Math.round(event.time / 100) * 100

  const lastScreenshot = screenshots.value[screenshots.value.length - 1]

  if (!lastScreenshot || lastScreenshot.time !== time) {
    const screenshot: EventScreenshot = {
      id: nextScreenshotId++,
      time,
      image: null,
      events: [
        event
      ]
    }
    event.screenshot = screenshot
    screenshots.value.push(screenshot)

    // Screenshot
    if (typeof browser !== 'undefined') {
      browser.runtime.sendMessage({
        action: 'vue-take-screenshot',
        id: screenshot.id
      })
    } else if (typeof chrome !== 'undefined' && chrome.tabs) {
      chrome.tabs.captureVisibleTab({
        format: 'png'
      }, dataUrl => {
        screenshot.image = dataUrl
      })
    }
  } else {
    event.screenshot = lastScreenshot
    lastScreenshot.events.push(event)
  }
}

export const supportsScreenshot = typeof browser !== 'undefined' || (typeof chrome !== 'undefined' && !!chrome.tabs)

if (typeof browser !== 'undefined') {
  browser.runtime.onMessage.addListener(req => {
    if (req.action === 'vue-screenshot-result') {
      const screenshot = screenshots.value.find(s => s.id === req.id)
      if (screenshot) {
        screenshot.image = req.dataUrl
      }
    }
  })
}

export function useScreenshots () {
  const { bridge } = useBridge()
  const { currentAppId } = useApps()

  function showScreenshot (screenshot: EventScreenshot = null) {
    bridge.send(BridgeEvents.TO_BACK_TIMELINE_SHOW_SCREENSHOT, {
      screenshot: screenshot
        ? {
            ...screenshot,
            events: screenshot.events.filter(event => event.appId === currentAppId.value).map(event => event.id)
          }
        : null
    })
  }

  return {
    screenshots,
    showScreenshot
  }
}
