import { posts } from '../../data/posts';

export async function GET() {
  const rssItems = posts.map(post => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <description><![CDATA[${post.desc}]]></description>
      <link>https://governed.run/now/${post.id}/</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <guid>https://governed.run/now/${post.id}/</guid>
      <category>${post.category}</category>
      <dc:creator>Carlos Rivera</dc:creator>
      <author>me@carlosrivera.im (Carlos Rivera)</author>
    </item>
  `).join('');

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
<channel>
  <title>Continuous Software Generation | Now</title>
  <link>https://governed.run/now/</link>
  <description>Company updates, thoughts on continuous software work, and reflections on building governed operational systems by Carlos Rivera.</description>
  <language>en-us</language>
  <atom:link href="https://governed.run/rss/now.xml" rel="self" type="application/rss+xml" />
  ${rssItems}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'X-Content-Type-Options': 'nosniff'
    }
  });
}

