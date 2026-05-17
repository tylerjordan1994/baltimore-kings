import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/project/football-team/',
      disallow: '/project/football-team/app/',
    },
    sitemap: 'https://tylerjordandesigns.com/project/football-team/sitemap.xml',
  }
}
