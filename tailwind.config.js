/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

module.exports = {
  theme: {
    extend: {
      colors: {
        green: {
          100: '#d3fce0',
          200: '#b0f8ca',
          300: '#94ebbc',
          400: '#64d4a0',
          500: '#42B983',
          600: '#2ea56f',
          700: '#1f8353',
          800: '#0d7445',
          900: '#00551f'
        },
        purple: {
          900: '#350066',
          800: '#4f0098',
          700: '#6806c1',
          600: '#8929e3',
          500: '#a44cf6',
          400: '#b96dff',
          300: '#c88eff',
          200: '#d7adff',
          100: '#e6ccff'
        },
        bluegray: {
          100: '#d9f9ff',
          200: '#c5e5ff',
          300: '#b1d1f1',
          400: '#9dbddd',
          500: '#89a9c9',
          600: '#7595b5',
          700: '#6181a1',
          800: '#4d6d8d',
          900: '#395979'
        },
        black: '#0b1015'
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
      },
      fontFamily: {
        mono: '\'Roboto Mono\', monospace'
      },
      fontSize: {
        '2xs': '.65rem',
        '3xs': '.6rem'
      },
      spacing: {
        0.5: '0.125rem',
        72: '18rem',
        80: '20rem',
        96: '24rem'
      }
    },
    darkSelector: '.vue-ui-dark-mode'
  },
  variants: {
    backgroundColor: ['hover', 'dark', 'dark-hover', 'group-hover', 'dark-group-hover', 'dark-even', 'dark-odd'],
    backgroundOpacity: ['dark'],
    borderColor: ['dark', 'dark-focus', 'dark-focus-within'],
    textColor: ['hover', 'dark', 'dark-hover', 'group-hover', 'dark-group-hover', 'dark-active', 'dark-placeholder'],
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
