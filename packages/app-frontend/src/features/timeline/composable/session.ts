import shortid from 'shortid'
import { toRaw } from '@vue/composition-api'
import { addNonReactiveProperties } from '@front/util/reactivity'
import {
  endTime,
  layersPerApp,
  markersAllApps,
  markersPerApp,
  maxTime,
  minTime,
  screenshots,
  selectedEvent,
  selectedLayer,
  startTime,
  TimelineSession,
} from './store'
import { sessions } from '.'

// @TODO export/import

export function createSessionFromCurrentState (): TimelineSession {
  const session = {
    duration: maxTime.value - minTime.value,
  } as TimelineSession
  addNonReactiveProperties(session, {
    id: shortid(),
    date: new Date(),
    imported: false,
    state: {
      minTime: minTime.value,
      maxTime: maxTime.value,
      startTime: startTime.value,
      endTime: endTime.value,
      layersPerApp: toRaw(layersPerApp.value),
      markersAllApps: toRaw(markersAllApps.value),
      markersPerApp: toRaw(markersPerApp.value),
      screenshots: toRaw(screenshots.value),
      selectedEvent: toRaw(selectedEvent.value),
      selectedLayer: toRaw(selectedLayer.value),
    },
  })
  return session
}

export function loadSession (session: TimelineSession) {
  minTime.value = session.state.minTime
  maxTime.value = session.state.maxTime
  startTime.value = session.state.startTime
  endTime.value = session.state.endTime
  layersPerApp.value = session.state.layersPerApp
  markersAllApps.value = session.state.markersAllApps
  markersPerApp.value = session.state.markersPerApp
  screenshots.value = session.state.screenshots
  selectedEvent.value = session.state.selectedEvent
  selectedLayer.value = session.state.selectedLayer
}

export function getSessionAtTime (time: number): TimelineSession | null {
  return sessions.value.find((session) => session.state.startTime <= time && session.state.endTime >= time)
}
