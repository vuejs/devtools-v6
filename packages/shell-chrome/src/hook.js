const script = document.createElement('script')
script.src = chrome.runtime.getURL('build/hook-exec.js')
script.onload = () => {
  script.remove()
}
;(document.head || document.documentElement).appendChild(script)
