const MAX_SERIALIZED_SIZE = 512 * 1024 // 1MB

function encode (data, replacer, list, seen) {
  let stored, key, value, i, l
  const seenIndex = seen.get(data)
  if (seenIndex != null) {
    return seenIndex
  }
  const index = list.length
  const proto = Object.prototype.toString.call(data)
  if (proto === '[object Object]') {
    stored = {}
    seen.set(data, index)
    list.push(stored)
    const keys = Object.keys(data)
    for (i = 0, l = keys.length; i < l; i++) {
      key = keys[i]
      value = data[key]
      if (replacer) value = replacer.call(data, key, value)
      stored[key] = encode(value, replacer, list, seen)
    }
  } else if (proto === '[object Array]') {
    stored = []
    seen.set(data, index)
    list.push(stored)
    for (i = 0, l = data.length; i < l; i++) {
      value = data[i]
      if (replacer) value = replacer.call(data, i, value)
      stored[i] = encode(value, replacer, list, seen)
    }
  } else {
    list.push(data)
  }
  return index
}

function decode (list, reviver) {
  let i = list.length
  let j, k, data, key, value, proto
  while (i--) {
    data = list[i]
    proto = Object.prototype.toString.call(data)
    if (proto === '[object Object]') {
      const keys = Object.keys(data)
      for (j = 0, k = keys.length; j < k; j++) {
        key = keys[j]
        value = list[data[key]]
        if (reviver) value = reviver.call(data, key, value)
        data[key] = value
      }
    } else if (proto === '[object Array]') {
      for (j = 0, k = data.length; j < k; j++) {
        value = list[data[j]]
        if (reviver) value = reviver.call(data, j, value)
        data[j] = value
      }
    }
  }
}

export function stringifyCircularAutoChunks (data: any, replacer: (this: any, key: string, value: any) => any = null, space: number = null) {
  let result
  try {
    result = arguments.length === 1
      ? JSON.stringify(data)
      // @ts-ignore
      : JSON.stringify(data, replacer, space)
  } catch (e) {
    result = stringifyStrictCircularAutoChunks(data, replacer, space)
  }
  if (result.length > MAX_SERIALIZED_SIZE) {
    const chunkCount = Math.ceil(result.length / MAX_SERIALIZED_SIZE)
    const chunks = []
    for (let i = 0; i < chunkCount; i++) {
      chunks.push(result.slice(i * MAX_SERIALIZED_SIZE, (i + 1) * MAX_SERIALIZED_SIZE))
    }
    return chunks
  }
  return result
}

export function parseCircularAutoChunks (data: any, reviver: (this: any, key: string, value: any) => any = null) {
  if (Array.isArray(data)) {
    data = data.join('')
  }
  const hasCircular = /^\s/.test(data)
  if (!hasCircular) {
    return arguments.length === 1
      ? JSON.parse(data)
      // @ts-ignore
      : JSON.parse(data, reviver)
  } else {
    const list = JSON.parse(data)
    decode(list, reviver)
    return list[0]
  }
}

export function stringifyStrictCircularAutoChunks (data: any, replacer: (this: any, key: string, value: any) => any = null, space: number = null) {
  const list = []
  encode(data, replacer, list, new Map())
  return space
    ? ' ' + JSON.stringify(list, null, space)
    : ' ' + JSON.stringify(list)
}
