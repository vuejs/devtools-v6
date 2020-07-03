interface Subscription {
  payload: any
  rawPayload: string
}

const activeSubs: Map<string, Subscription[]> = new Map()

function getSubs (type: string) {
  let subs = activeSubs.get(type)
  if (!subs) {
    subs = []
    activeSubs.set(type, subs)
  }
  return subs
}

export function subscribe (type: string, payload: any) {
  const rawPayload = JSON.stringify(payload)
  getSubs(type).push({
    payload,
    rawPayload
  })
}

export function unsubscribe (type: string, payload: any) {
  const rawPayload = JSON.stringify(payload)
  const subs = getSubs(type)
  const index = subs.findIndex(sub => sub.rawPayload === rawPayload)
  if (index !== -1) {
    subs.splice(index, 1)
  }
}

export function isSubscribed (
  type: string,
  predicate: (sub: Subscription) => boolean = () => true
) {
  return getSubs(type).some(predicate)
}
