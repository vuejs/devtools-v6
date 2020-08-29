/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

module.exports = {
  theme: {
    extend: {
      color: {
        green: {
          500: '#42B983'
        }
      },
      cursor: {
        'ew-resize': 'ew-resize',
        'ns-resize': 'ns-resize'
      },
      zIndex: {
        60: 60,
        70: 70,
        80: 80,
        90: 90,
        100: 100
      }
    },
    darkSelector: '.vue-ui-dark-mode'
  },
  variants: {
    backgroundColor: ['hover', 'dark', 'dark-hover', 'dark-group-hover', 'dark-even', 'dark-odd'],
    backgroundOpacity: ['dark'],
    borderColor: ['dark', 'dark-focus', 'dark-focus-within'],
    textColor: ['dark', 'dark-hover', 'dark-active', 'dark-placeholder'],
    visibility: ['group-hover']
  },
  plugins: [
    require('tailwindcss-dark-mode')()
  ],
  purge: {
    content: [
      path.resolve(__dirname, './packages/app-frontend/src/**/*.vue')
    ],
    options: {
      whitelist: [
        'vue-ui-dark-mode'
      ]
    }
  }
}
