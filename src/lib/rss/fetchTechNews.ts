import Parser from 'rss-parser'

export type NewsItem = {
  title: string
  excerpt: string
  imageUrl: string | null
  sourceUrl: string
  sourceName: string
  publishedAt: string
  category: string
}

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: false }],
      ['media:thumbnail', 'mediaThumbnail', { keepArray: false }],
      ['enclosure', 'enclosure', { keepArray: false }],
    ],
  },
})

const RSS_SOURCES = [
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Tech',
  },
  {
    name: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    category: 'Tech',
  },
  {
    name: 'Wired',
    url: 'https://www.wired.com/feed/rss',
    category: 'Tech',
  },
  {
    name: 'Ars Technica',
    url: 'https://feeds.arstechnica.com/arstechnica/index',
    category: 'Tech',
  },
  {
    name: 'BBC Technology',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Tech',
  },
]

interface RssItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  content?: string;
  'content:encoded'?: string;
  contentSnippet?: string;
  mediaContent?: { $: { url: string } };
  mediaThumbnail?: { $: { url: string } };
  enclosure?: { url: string };
  'media:content'?: { $: { url: string } };
  'media:thumbnail'?: { $: { url: string } };
}

function extractImage(item: RssItem): string | null {
  if (item.mediaContent?.$.url) return item.mediaContent.$.url
  if (item.mediaThumbnail?.$.url) return item.mediaThumbnail.$.url
  if (item.enclosure?.url) return item.enclosure.url
  if (item['media:content']?.$.url) return item['media:content'].$.url
  if (item['media:thumbnail']?.$.url) return item['media:thumbnail'].$.url

  const content = item.content ?? item['content:encoded'] ?? ''
  const imgMatch = content.match(/<img[^>]+src="([^">]+)"/i)
  if (imgMatch?.[1]) return imgMatch[1]

  return null
}

function cleanExcerpt(text: string): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
    .slice(0, 200)
}

async function fetchSingleFeed(source: typeof RSS_SOURCES[0]): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(source.url)
    return feed.items.slice(0, 12).map((item) => ({
      title: item.title ?? 'Untitled',
      excerpt: cleanExcerpt(item.contentSnippet ?? item.content ?? item.summary ?? ''),
      imageUrl: extractImage(item),
      sourceUrl: item.link ?? '#',
      sourceName: source.name,
      publishedAt: item.pubDate ?? item.isoDate ?? new Date().toISOString(),
      category: source.category,
    }))
  } catch (error) {
    console.error(`Failed to fetch RSS from ${source.name}:`, error)
    return []
  }
}

export async function fetchTechNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchSingleFeed(source))
  )

  const allNews: NewsItem[] = []
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value)
    }
  })

  allNews.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )

  return allNews
}
