const activeSubs: Map<string, Map<string, boolean>> = new Map()

function getSubs(type: string) {
  let subs = activeSubs.get(type)
  if (!subs) {
    subs = new Map()
    activeSubs.set(type, subs)
  }
  return subs
}

export function subscribe(type: string, key: string) {
  getSubs(type).set(key, true)
}

export function unsubscribe(type: string, key: string) {
  const subs = getSubs(type)
  subs.delete(key)
}

export function isSubscribed(
  type: string,
  key: string,
) {
  return getSubs(type).has(key)
}
