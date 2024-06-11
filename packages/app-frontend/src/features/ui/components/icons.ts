const icons = require.context(
  '@akryum/md-icons-svg/svg/',
  true,
  /materialicons\/24px\.svg$/,
)

export default {
  install() {
    const sprites = ['']
    let spriteIndex = 0
    // Load all the SVG symbols
    icons.keys().forEach((key, index) => {
      let result = icons(key)
      const [, iconName] = /(\w+)\/materialicons/.exec(key)
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      const [, content] = /<svg.+?>(.*)<\/svg>/.exec(result)
      result = `<svg xmlns="http://www.w3.org/2000/svg" id="ic_${iconName}_standard" viewBox="0 0 24 24">${content}</svg>`
      sprites[spriteIndex] += result
      if ((index + 1) % 40 === 0) {
        sprites.push('')
        spriteIndex++
      }
    })
    for (const html of sprites) {
      const iconsWrapper = document.createElement('div')
      iconsWrapper.style.display = 'none'
      iconsWrapper.innerHTML = html
      document.body.insertBefore(iconsWrapper, document.body.firstChild)
    }
  },
}

export function generateHtmlIcon(icon: string) {
  return `<div class="vue-ui-icon"><svg><use href="#ic_${icon}_standard"></use></svg></div>`
}
