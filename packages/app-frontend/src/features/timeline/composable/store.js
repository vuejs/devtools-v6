import { ref } from '@vue/composition-api'

export const startTime = ref(0)
export const endTime = ref(0)
export const minTime = ref(0)
export const maxTime = ref(0)

export const timelineIsEmpty = ref(true)

export const cursorTime = ref(null)

export const layersPerApp = ref({})
export const hiddenLayersPerApp = ref({})
export const vScrollPerApp = ref({})

export const selectedEvent = ref(null)
export const hoverLayerId = ref(null)

export const inspectedEvent = ref(null)
export const inspectedEventData = ref(null)
export const inspectedEventPendingId = ref(null)

export const screenshots = ref([])
