export type TimeFormat = 'ms' | 'default'

export function formatTime (timestamp: string | number | Date, format?: TimeFormat) {
  const date = new Date(timestamp)
  return `${date.toString().match(/\d\d:\d\d:\d\d/)[0]}${format === 'ms' ? '.' + String(date.getMilliseconds()).padStart(3, '0') : ''}`
}
