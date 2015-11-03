const overlay = document.createElement('div')
overlay.style.backgroundColor = 'rgba(104, 182, 255, 0.35)'
overlay.style.position = 'fixed'
overlay.style.zIndex = '99999'

export function highlight (instance) {
  if (!instance) return
  if (!instance._isFragment) {
    const rect = instance.$el.getBoundingClientRect()
    showOverlay(rect.width, rect.height, rect.left, rect.top)
  } else {
    highlightFragment(instance)
  }
}

export function unHighlight () {
  document.body.removeChild(overlay)
}

function highlightFragment ({ _fragmentStart, _fragmentEnd }) {
  const Vue = window.__VUE_DEVTOOLS_GLOBAL_HOOK__.Vue
  Vue.util.mapNodeRange(_fragmentStart, _fragmentEnd, function (node) {
    
  })
}

function showOverlay (w, h, x, y) {
  overlay.style.width = w + 'px'
  overlay.style.height = h + 'px'
  overlay.style.left = x + 'px'
  overlay.style.top = y + 'px'
  document.body.appendChild(overlay)
}
