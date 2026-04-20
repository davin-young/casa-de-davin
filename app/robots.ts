import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        disallow: '/',
      },
      {
        userAgent: 'GPTBot',
        disallow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',
      },
      {
        userAgent: 'CCBot',
        disallow: '/',
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',
      },
      {
        userAgent: 'Google-Extended',
        disallow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        disallow: '/',
      },
      {
        userAgent: 'Bytespider',
        disallow: '/',
      },
      {
        userAgent: 'Diffbot',
        disallow: '/',
      },
      {
        userAgent: 'Omgilibot',
        disallow: '/',
      },
      {
        userAgent: 'FacebookBot',
        disallow: '/',
      },
      {
        userAgent: 'Applebot-Extended',
        disallow: '/',
      },
      {
        userAgent: 'cohere-ai',
        disallow: '/',
      },
    ],
  };
}
