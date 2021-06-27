module.exports = {
  title: 'Vue Devtools',
  description: 'Browser devtools extension for debugging Vue.js applications',

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }],
  ],

  themeConfig: {
    repo: 'vuejs/vue-devtools',
    logo: '/logo-header.svg',
    docsDir: 'docs',
    docsBranch: 'next',
    editLinks: true,
    editLinkText: 'Suggest changes to this page',

    nav: [
      { text: 'Guide', link: '/guide/installation' },
      {
        text: 'Plugins',
        items: [
          { text: 'Plugin development guide', link: '/plugin/plugins-guide' },
          { text: 'API Reference', link: '/plugin/api-reference' },
        ]
      },
      {
        text: '💚️ Sponsor',
        link: 'https://github.com/sponsors/Akryum',
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          children: [
            {
              text: 'Installation',
              link: '/guide/installation',
            },
            {
              text: 'Open in editor',
              link: '/guide/open-in-editor',
            },
            {
              text: 'F.A.Q.',
              link: '/guide/faq',
            },
            {
              text: 'Contributing',
              link: '/guide/contributing',
            },
          ],
        },
      ],
    },
  },
}
