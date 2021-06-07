import tinycolor from 'tinycolor2'

export function toStrHex (color: number) {
  return color.toString(16).padStart(6, '0')
}

export function dimColor (color: number, dark: boolean, amount = 20) {
  let c = tinycolor(toStrHex(color))
  if (dark) {
    c = c.darken(amount)
  } else {
    c = c.lighten(amount)
  }
  return parseInt(`0x${c.toHex()}`)
}

export function boostColor (color: number, dark: boolean, amount = 10) {
  let c = tinycolor(toStrHex(color))
  if (dark) {
    c = c.lighten(amount)
  } else {
    c = c.darken(amount)
  }
  return parseInt(`0x${c.toHex()}`)
}
