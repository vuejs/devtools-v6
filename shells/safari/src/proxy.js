/*global safari*/
function handleMessage (evt) {
  const name = evt.name
  const data = evt.message
  if (name === 'inject') {
    eval(data)  // eslint-disable-line no-eval
    safari.self.tab.dispatchMessage('script-loaded', data)
  } else if (name === 'send') {
    const script = document.constructor.prototype.createElement.call(document, 'script')
    const msg = JSON.stringify({ source: 'vue-devtools-proxy', payload: data })
    script.innerHTML = `window.postMessage(${msg}, '*');`
    document.documentElement.appendChild(script)
    script.parentNode.removeChild(script)
  }
}

safari.self.addEventListener('message', handleMessage, false)
window.addEventListener('message', (evt) => {
  if (evt.data.source === 'vue-devtools-backend' && evt.data.payload) {
    safari.self.tab.dispatchMessage('send', { source: 'vue-devtools-proxy', payload: evt.data.payload })
  }
})
