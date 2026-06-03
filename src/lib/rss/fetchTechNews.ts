export type NewsItem = {
  title: string
  excerpt: string
  imageUrl: string | null
  sourceUrl: string
  sourceName: string
  publishedAt: string
  category: string
}

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

function extractTagContent(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return match ? match[1].trim() : null
}

function extractAllTagContent(xml: string, tag: string): string[] {
  const results: string[] = []
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi')
  let match
  while ((match = regex.exec(xml)) !== null) {
    results.push(match[1].trim())
  }
  return results
}

function extractAttribute(xml: string, startPos: number, attr: string): string | null {
  const sub = xml.slice(startPos, startPos + 500)
  const match = sub.match(new RegExp(`${attr}\\s*=\\s*"([^"]*)"`, 'i'))
  return match ? match[1] : null
}

function extractImageFromItem(itemXml: string): string | null {
  const mediaContentMatch = itemXml.match(/<media:content[^>]*url="([^"]+)"/i)
  if (mediaContentMatch?.[1]) return mediaContentMatch[1]

  const mediaThumbMatch = itemXml.match(/<media:thumbnail[^>]*url="([^"]+)"/i)
  if (mediaThumbMatch?.[1]) return mediaThumbMatch[1]

  const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]+)"/i)
  if (enclosureMatch?.[1]) return enclosureMatch[1]

  const imgMatch = itemXml.match(/<img[^>]+src="([^"]+)"/i)
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
    const response = await fetch(source.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CollegeNewspaper/1.0)' },
    })
    if (!response.ok) {
      console.error(`Failed to fetch RSS from ${source.name}: ${response.status}`)
      return []
    }

    const xml = await response.text()

    const items: NewsItem[] = []
    const itemRegex = /<item>([\s\S]*?)<\/item>/gi
    let itemMatch

    while ((itemMatch = itemRegex.exec(xml)) !== null) {
      const itemXml = itemMatch[1]

      const title = extractTagContent(itemXml, 'title') ?? 'Untitled'
      const link = extractTagContent(itemXml, 'link') ?? '#'
      const pubDate = extractTagContent(itemXml, 'pubDate')
      const contentEncoded = extractTagContent(itemXml, 'content:encoded')
      const content = extractTagContent(itemXml, 'content') ?? contentEncoded ?? ''
      const description = extractTagContent(itemXml, 'description')

      items.push({
        title,
        excerpt: cleanExcerpt(contentEncoded ?? description ?? content),
        imageUrl: extractImageFromItem(itemXml),
        sourceUrl: link,
        sourceName: source.name,
        publishedAt: pubDate ?? new Date().toISOString(),
        category: source.category,
      })

      if (items.length >= 12) break
    }

    return items
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
