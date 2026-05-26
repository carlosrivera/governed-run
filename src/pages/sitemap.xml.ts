import { posts } from '../data/posts';

export async function GET() {
  const staticPages = [
    '',
    'now/',
    'hub/'
  ];

  const postPages = posts.map(post => `now/${post.id}/`);
  const allPages = [...staticPages, ...postPages];

  const sitemapItems = allPages.map(page => `
  <url>
    <loc>https://governed.run/${page}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>
  `).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapItems}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}
