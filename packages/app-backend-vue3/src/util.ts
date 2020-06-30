import path from 'path'

export function flatten (items) {
  return items.reduce((acc, item) => {
    if (item instanceof Array) acc.push(...flatten(item))
    else if (item) acc.push(item)

    return acc
  }, [])
}

// Use a custom basename functions instead of the shimed version
// because it doesn't work on Windows
export function basename (filename, ext) {
  return path.basename(
    filename.replace(/^[a-zA-Z]:/, '').replace(/\\/g, '/'),
    ext
  )
}
