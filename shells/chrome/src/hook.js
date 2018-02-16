// This script is injected into every page.
import { installHook } from 'src/backend/hook'
import { isFirefox } from 'src/devtools/env'

// inject the hook
if (document instanceof HTMLDocument) {
  const source = ';(' + installHook.toString() + ')(window)'

  if (isFirefox) {
    /* eslint-disable no-eval */
    window.eval(source) // in Firefox, this evaluates on the content window
    /* eslint-enable no-eval */
  } else {
    const script = document.createElement('script')
    script.textContent = source
    document.documentElement.appendChild(script)
    script.parentNode.removeChild(script)
  }
}
