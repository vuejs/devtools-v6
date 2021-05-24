module.exports = {
  title: 'Vue Devtools',
  description: 'Browser devtools extension for debugging Vue.js applications',

  themeConfig: {
    repo: 'vuejs/vue-devtools',
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
          ],
        },
      ],
    },
  },
}
