/* eslint-disable @typescript-eslint/no-var-requires */

const path = require('path')

module.exports = {
  theme: {
    extend: {
      colors: {
        green: {
          50: '#ecf8f7',
          100: '#d3f7ef',
          200: '#a5f2db',
          300: '#66e9c2',
          400: '#20d99b',
          500: '#42B983',
          600: '#09ab56',
          700: '#0f8c4a',
          800: '#126e41',
          900: '#115937'
        },
        purple: {
          50: '#f3f3fa',
          100: '#ece3fa',
          200: '#ddc3f9',
          300: '#cea3f9',
          400: '#c378f9',
          500: '#a44cf6',
          600: '#a331f7',
          700: '#8128e8',
          800: '#6523c4',
          900: '#521fa0'
        },
        bluegray: {
          50: '#f3f9fb',
          100: '#e4f4f9',
          200: '#c5e7f4',
          300: '#9cd5f0',
          400: '#89a9c9',
          500: '#328de3',
          600: '#266ad2',
          700: '#2653ae',
          800: '#224082',
          900: '#1d3564'
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
        mono: '\'Roboto Mono\', Menlo, Consolas, monospace'
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
    }
  },
  variants: {
    backgroundColor: ['hover', 'group-hover', 'dark'],
    backgroundOpacity: ['hover', 'group-hover', 'dark'],
    textColor: ['hover', 'group-hover', 'dark'],
    visibility: ['group-hover']
  },
  darkMode: 'class',
  mode: 'jit',
  purge: {
    content: [
      path.resolve(__dirname, './packages/app-frontend/src/**/*.{js,jsx,ts,tsx,vue}'),
      path.resolve(__dirname, './packages/app-backend-core/src/**/*.{js,jsx,ts,tsx,vue}'),
      path.resolve(__dirname, './packages/app-backend-vue1/src/**/*.{js,jsx,ts,tsx,vue}'),
      path.resolve(__dirname, './packages/app-backend-vue2/src/**/*.{js,jsx,ts,tsx,vue}'),
      path.resolve(__dirname, './packages/app-backend-vue3/src/**/*.{js,jsx,ts,tsx,vue}'),
      path.resolve(__dirname, './packages/shared-utils/src/**/*.{js,jsx,ts,tsx,vue}')
    ]
  }
}
