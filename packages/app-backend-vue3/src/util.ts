import path from 'path'

export function flatten (items) {
  return items.reduce((acc, item) => {
    if (item instanceof Array) acc.push(...flatten(item))
    else if (item) acc.push(item)

    return acc
  }, [])
}

export function returnError (cb: () => any) {
  try {
    return cb()
  } catch (e) {
    return e
  }
}
