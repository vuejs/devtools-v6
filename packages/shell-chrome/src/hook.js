// This script is injected into every page.
import { installHook } from '@back/hook'
import { isFirefox } from '@utils/env'

// inject the hook
if (document instanceof HTMLDocument) {
  const source = ';(' + installHook.toString() + ')(window)'

  if (isFirefox) {
    // eslint-disable-next-line no-eval
    window.eval(source) // in Firefox, this evaluates on the content window
  } else {
    const script = document.createElement('script')
    script.textContent = source
    document.documentElement.appendChild(script)
    script.parentNode.removeChild(script)
  }
}
