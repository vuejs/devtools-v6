window.addEventListener('message', (event) => {
  if (event.data.key === '_vue-devtools-send-message') {
    chrome.runtime.sendMessage(event.data.message)
  }
}, false)

const script = document.createElement('script')
script.src = chrome.runtime.getURL('build/detector-exec.js')
script.onload = () => {
  script.remove()
}
;(document.head || document.documentElement).appendChild(script)
