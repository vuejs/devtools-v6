export function formatTime (timestamp, format) {
  const date = new Date(timestamp)
  return `${date.toString().match(/\d\d:\d\d:\d\d/)[0]}${format === 'ms' ? '.' + date.getMilliseconds() : ''}`
}
