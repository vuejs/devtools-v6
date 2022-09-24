import { ref } from 'vue'
import * as PIXI from 'pixi.js-legacy'

let installedFonts = false

export async function installFonts () {
  if (installedFonts) return

  try {
    await document.fonts.load('10px "Roboto Mono"')
  } catch (e) {
    console.error(e)
  }

  PIXI.BitmapFont.from('roboto-black', {
    fontFamily: 'Roboto Mono',
    fontSize: 9,
    fill: '#000000',
  }, {
    resolution: window.devicePixelRatio,
  })

  PIXI.BitmapFont.from('roboto-white', {
    fontFamily: 'Roboto Mono',
    fontSize: 9,
    fill: '#ffffff',
  }, {
    resolution: window.devicePixelRatio,
  })

  installedFonts = true
}

export function useFonts () {
  const loaded = ref(installedFonts)

  async function _load () {
    await installFonts()
    loaded.value = true
  }
  _load()

  return {
    loaded,
  }
}
