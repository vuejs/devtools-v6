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
  const rawPayload = getRawPayload(payload)
  getSubs(type).push({
    payload,
    rawPayload,
  })
}

export function unsubscribe (type: string, payload: any) {
  const rawPayload = getRawPayload(payload)
  const subs = getSubs(type)
  let index: number
  while ((index = subs.findIndex(sub => sub.rawPayload === rawPayload)) !== -1) {
    subs.splice(index, 1)
  }
}

function getRawPayload (payload: any) {
  const data = Object.keys(payload).sort().reduce((acc, key) => {
    acc[key] = payload[key]
    return acc
  }, {})
  return JSON.stringify(data)
}

export function isSubscribed (
  type: string,
  predicate: (sub: Subscription) => boolean = () => true,
) {
  return getSubs(type).some(predicate)
}
