export function isBeingDestroyed (instance) {
  return instance._isBeingDestroyed || instance.isUnmounted
}

export function getAppRecord (instance) {
  if (instance.root) {
    return instance.root.__VUE_DEVTOOLS_APP_RECORD__
  }
}

export function isFragment (instance) {
  const appRecord = getAppRecord(instance)
  if (appRecord) {
    return appRecord.types.Fragment === instance.subTree.type
  }
}
