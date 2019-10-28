import LRU from 'lru-cache'

export const snapshotsCache = new LRU({
  max: 5
})
