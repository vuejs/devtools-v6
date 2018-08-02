import { installHook } from 'src/backend/hook'

const target = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : {}

installHook(target)
