/*global safari*/
const script = document.constructor.prototype.createElement.call(document, 'script')
script.src = `${safari.extension.baseURI}build/hook.js`
document.documentElement.appendChild(script)
script.parentNode.removeChild(script)
