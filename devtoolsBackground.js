/**
 * Set dev tools panel content by returning an info object.
 *
 * @return {Object}
 */

function setPanelContent () {
  if ($0) {
    var el = $0
    var instance = el.__vue__
    while ((!instance || instance._isAnonymous) && el.parentNode) {
      el = el.parentNode
      instance = el.__vue__
    }
    if (!instance) {
      return {}
    } else {
      window.$vue = instance
      var state = {}
      var meta = ['$value', '$index', '$key']
      for (var key in instance) {
        if (key.charAt(0) === '_') continue
        if (key.charAt(0) === '$' && meta.indexOf(key) < 0) continue
        if (typeof instance[key] === 'function') continue
        if (instance.hasOwnProperty(key)) {
          state[key] = instance[key]
        } else {
          (state.$$scope = (state.$$scope || {}))[key] = instance[key]
        }
      }
      // convert ES5 getter/setters back to a plain object, and
      // deal with circular references.
      var seen = []
      state = JSON.parse(JSON.stringify(state, function (key, val) {
        if (val && typeof val === 'object') {
          if (seen.indexOf(val) > -1) {
            return '[circular reference]'
          }
          seen.push(val)
        }
        return val
      }))
      state.$$owner = instance
      return state
    }
  } else {
    return {}
  }
}

var panels = chrome.devtools.panels
var expression = "(" + setPanelContent.toString() + ")()"
panels.elements.createSidebarPane(
  'Vue.js Properties',
  function (sidebar) {
    panels.elements.onSelectionChanged.addListener(function () {
      sidebar.setExpression(expression)
    })
  }
)