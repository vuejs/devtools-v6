export function installToast (target) {
  if (typeof document === 'undefined') return
  let toastEl = null
  let toastTimer = 0

  const colors = {
    normal: '#3BA776',
    warn: '#DB6B00',
    error: '#DB2600'
  }

  target.__VUE_DEVTOOLS_TOAST__ = (message, type) => {
    const color = colors[type] || colors.normal
    console.log(`%c vue-devtools %c ${message} %c `,
      'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
      `background: ${color}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff`,
      'background:transparent')
    if (!toastEl) {
      toastEl = document.createElement('div')
      toastEl.addEventListener('click', removeToast)

      const vueDevtoolsToast = document.createElement('div')
      vueDevtoolsToast.id = 'vue-devtools-toast'
      vueDevtoolsToast.style.position = 'fixed'
      vueDevtoolsToast.style.bottom = '6px'
      vueDevtoolsToast.style.left = '0'
      vueDevtoolsToast.style.right = '0'
      vueDevtoolsToast.style.height = '0'
      vueDevtoolsToast.style.display = 'flex'
      vueDevtoolsToast.style.alignItems = 'flex-end'
      vueDevtoolsToast.style.justifyContent = 'center'
      vueDevtoolsToast.style.zIndex = '999999999999999999999'
      vueDevtoolsToast.style.fontFamily = 'Menlo, Consolas, monospace'
      vueDevtoolsToast.style.fontSize = '14px'

      const vueWrapper = document.createElement('div')
      vueWrapper.className = 'vue-wrapper'
      vueWrapper.style.padding = '6px 12px'
      vueWrapper.style.background = color
      vueWrapper.style.color = 'white'
      vueWrapper.style.borderRadius = '3px'
      vueWrapper.style.flex = 'auto 0 1'
      vueWrapper.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)'
      vueWrapper.style.cursor = 'pointer'

      const vueContent = document.createElement('div')
      vueContent.className = 'vue-content'

      vueWrapper.appendChild(vueContent)
      vueDevtoolsToast.appendChild(vueWrapper)
      toastEl.appendChild(vueDevtoolsToast)
      document.body.appendChild(toastEl)
    } else {
      toastEl.querySelector('.vue-wrapper').style.background = color
    }

    toastEl.querySelector('.vue-content').innerText = message

    clearTimeout(toastTimer)
    toastTimer = setTimeout(removeToast, 5000)
  }

  function removeToast () {
    clearTimeout(toastTimer)
    if (toastEl) {
      document.body.removeChild(toastEl)
      toastEl = null
    }
  }
}
