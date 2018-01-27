export default {
  install (Vue) {
    const iconsWrapper = document.createElement('div')
    iconsWrapper.style.display = 'none'
    // Load all the SVG symbols
    const icons = require.context('raw-loader!material-design-icons/sprites/svg-sprite', false, /svg-sprite-(\w+)-symbol\.svg$/i)
    icons.keys().forEach(key => {
      const result = icons(key)
      iconsWrapper.innerHTML += result
    })
    document.body.appendChild(iconsWrapper)

    Vue.component('BaseIcon', {
      props: {
        icon: {
          type: String,
          required: true
        }
      },
      render (h) {
        return h('div', {
          staticClass: 'svg-icon',
          on: { click: event => this.$emit('click', event) }
        }, [
          h('svg', [
            h('use', { attrs: {
              'xlink:href': `#ic_${this.icon}_24px`
            }})
          ])
        ])
      }
    })
  }
}

export function generateHtmlIcon (icon) {
  return `<div class="svg-icon"><svg><use xlink:href="#ic_${icon}_24px"></use></svg></div>`
}
