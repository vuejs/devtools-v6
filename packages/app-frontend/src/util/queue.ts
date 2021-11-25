export class Queue<T = any> {
  private existsMap: Map<T, boolean> = new Map()
  private firstItem: QueueItem<T> | null = null
  private lastItem: QueueItem<T> | null = null

  add (value: T) {
    if (!this.existsMap.has(value)) {
      this.existsMap.set(value, true)
      const item = {
        current: value,
        next: null,
      }
      if (!this.firstItem) {
        this.firstItem = item
      }
      if (this.lastItem) {
        this.lastItem.next = item
      }
      this.lastItem = item
    }
  }

  shift (): T | null {
    if (this.firstItem) {
      const item = this.firstItem
      this.firstItem = item.next
      if (!this.firstItem) {
        this.lastItem = null
      }
      this.existsMap.delete(item.current)
      return item.current
    }
    return null
  }

  isEmpty () {
    return !this.firstItem
  }

  has (value: T) {
    return this.existsMap.has(value)
  }
}

interface QueueItem<T> {
  current: T
  next: QueueItem<T> | null
}
