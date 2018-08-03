import SharedData, { watch } from 'src/shared-data'

let frames = 0
let frameTime
let secondsTimer
let bridge

export function initPerfBackend (Vue, _bridge) {
  bridge = _bridge

  watch('recordPerf', value => {
    if (value) {
      startRecording()
    } else {
      stopRecording()
    }
  })
}

function startRecording () {
  frames = 0
  frameTime = performance.now()
  secondsTimer = setInterval(frameInterval, 500)
  requestAnimationFrame(frame)
}

function stopRecording () {
  clearInterval(secondsTimer)
}

function frame () {
  frames++
  if (SharedData.recordPerf) {
    requestAnimationFrame(frame)
  }
}

function frameInterval () {
  const metric = {
    type: 'fps',
    time: Date.now(),
    start: frameTime,
    end: frameTime = performance.now()
  }
  metric.value = Math.round(frames / (metric.end - metric.start) * 1000)
  bridge.send('perf:add-metric', metric)
  frames = 0
}
