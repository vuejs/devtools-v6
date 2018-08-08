export function formatTime (timestamp) {
  return (new Date(timestamp)).toString().match(/\d\d:\d\d:\d\d/)[0]
}
