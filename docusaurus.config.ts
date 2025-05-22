import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'GridCapa',
  tagline: 'User guide and detailed process description',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'http://PLACEHOLDER_URL/',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/PLACEHOLDER_BASE_URL/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'farao-community', // Usually your GitHub org/user name.
  projectName: 'gridcapa-docs', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
          'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: 'GridCapa',
      logo: {
        alt: 'GridCapa Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/farao-community/gridcapa-docs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'About GridCapa',
              to: '/docs/about',
            },
            {
              label: 'User guide',
              to: '/docs/user-guide',
            },
            {
              label: 'Process documentation',
              to: '/docs/category/process-documentation',
            },
            {
              label: 'Technical architecture',
              to: '/docs/technical-architecture',
            },
            {
              label: 'Glossary',
              to: '/docs/glossary',
            },
          ],
        },
        {
          title: 'GridCapa process',
          items: [
            {
              label: 'CORE Capacity Calculation',
              to: '/docs/process-documentation/core-cc/overview',
            },
            {
              label: 'IN export Capacity Calculation',
              to: '/docs/process-documentation/in-export-cc/overview',
            },
            {
              label: 'IN import Capacity Calculation',
              to: '/docs/process-documentation/in-import-cc/overview',
            },
            {
              label: 'IN import EC Capacity Calculation',
              to: '/docs/process-documentation/in-import-ec-cc/overview',
            },
            {
              label: 'SWE Capacity Calculation',
              to: '/docs/process-documentation/swe-cc/overview',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/farao-community/gridcapa-docs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} RTE (http://www.rte-france.com). Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
