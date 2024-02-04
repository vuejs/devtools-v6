import throttle from 'lodash/throttle'

interface ThrottleQueueItem {
  fn: Function
  key: string
}

export function createThrottleQueue(wait: number) {
  const queue: ThrottleQueueItem[] = []
  const tracker: Map<string, ThrottleQueueItem> = new Map()

  function flush() {
    for (const item of queue) {
      item.fn()
      tracker.delete(item.key)
    }
    queue.length = 0
  }

  const throttledFlush = throttle(flush, wait)

  function add(key: string, fn: Function) {
    if (!tracker.has(key)) {
      const item = { key, fn }
      queue.push(item)
      tracker.set(key, item)
      throttledFlush()
    }
    else {
      const item = tracker.get(key)!
      item.fn = fn
    }
  }

  return {
    add,
  }
}
