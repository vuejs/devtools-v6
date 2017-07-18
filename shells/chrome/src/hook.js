// This script is injected into every page.
import { installHook } from 'src/backend/hook'

// inject the hook, avoid non HTML pages
if (document.doctype !== null) {
  const script = document.createElement('script')
  script.textContent = ';(' + installHook.toString() + ')(window)'
  document.documentElement.appendChild(script)
  script.parentNode.removeChild(script)
}
