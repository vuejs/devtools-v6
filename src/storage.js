// If we can, we use the browser extension API to store data
// it's async though, so we synchronize changes from an intermediate
// storageData object
const useStorage = typeof chrome !== 'undefined' && typeof chrome.storage !== 'undefined'

let storageData = null

export function init () {
  return new Promise((resolve) => {
    if (useStorage) {
      chrome.storage.local.get(null, result => {
        storageData = result
        resolve()
      })
    } else {
      storageData = {}
      resolve()
    }
  })
}

export function get (key, defaultValue = null) {
  checkStorage()
  if (useStorage) {
    return getDefaultValue(storageData[key], defaultValue)
  } else {
    try {
      return getDefaultValue(JSON.parse(localStorage.getItem(key)), defaultValue)
    } catch (e) {}
  }
}

export function set (key, val) {
  checkStorage()
  if (useStorage) {
    storageData[key] = val
    chrome.storage.local.set({ [key]: val })
  } else {
    try {
      localStorage.setItem(key, JSON.stringify(val))
    } catch (e) {}
  }
}

export function remove (key) {
  checkStorage()
  if (useStorage) {
    delete storageData[key]
    chrome.storage.local.remove([key])
  } else {
    try {
      localStorage.removeItem(key)
    } catch (e) {}
  }
}

export function clear () {
  checkStorage()
  if (useStorage) {
    storageData = {}
    chrome.storage.local.clear()
  } else {
    try {
      localStorage.clear()
    } catch (e) {}
  }
}

function checkStorage () {
  if (!storageData) {
    throw new Error(`Storage wasn't initialized with 'init()'`)
  }
}

function getDefaultValue (value, defaultValue) {
  if (value == null) {
    return defaultValue
  }
  return value
}
