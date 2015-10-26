// This script is injected into every page.
import { installHook } from '../../../src/hook'

// inject the hook
const script = document.createElement('script')
script.textContent = ';(' + installHook.toString() + ')(window)'
document.documentElement.appendChild(script)
script.parentNode.removeChild(script)
