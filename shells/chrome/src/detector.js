window.addEventListener('message', e => {
  if (e.source === window && e.data.vueDetected) {
    chrome.runtime.sendMessage(e.data)
  }
})

function detect (win) {
  setTimeout(() => {
    const all = document.querySelectorAll('*')
    const el = [].find.call(all, e => e.__vue__)
    if (el) {
      let Vue = el.__vue__.constructor
      while (Vue.super) {
        Vue = Vue.super
      }
      win.postMessage({
        devtoolsEnabled: Vue.config.devtools,
        vueDetected: true
      }, '*')
    }
  }, 100)
}

// inject the hook
const script = document.createElement('script')
script.textContent = ';(' + detect.toString() + ')(window)'
document.documentElement.appendChild(script)
script.parentNode.removeChild(script)
