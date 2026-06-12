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
  { name: 'YourStory', url: 'https://yourstory.com/feed', category: 'Indian Tech', priority: 2 },
  { name: 'The Hindu Tech', url: 'https://www.thehindu.com/sci-tech/technology/feed.rss', category: 'Indian Tech', priority: 2 },
  { name: 'Indian Express Tech', url: 'https://indianexpress.com/section/technology/feed/', category: 'Indian Tech', priority: 2 },
  { name: 'Gadgets360', url: 'https://www.gadgets360.com/rss/feeds', category: 'Indian Tech', priority: 2 },
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Global Tech', priority: 1 },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', category: 'Global Tech', priority: 1 },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', category: 'Global Tech', priority: 1 },
  { name: 'Wired', url: 'https://www.wired.com/feed/rss', category: 'Global Tech', priority: 1 },
  { name: 'BBC Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'Global Tech', priority: 1 },
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

  const enclosureMatch = itemXml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image/i)
  if (enclosureMatch?.[1]) return enclosureMatch[1]

  const enclosureAnyMatch = itemXml.match(/<enclosure[^>]*url="([^"]+)"/i)
  if (enclosureAnyMatch?.[1]) return enclosureAnyMatch[1]

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
      signal: AbortSignal.timeout(8000),
    })
    if (!response.ok) {
      console.warn(`[RSS] ${source.name} returned ${response.status}`)
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
      const imageUrl = extractImageFromItem(itemXml)

      if (!imageUrl) continue

      items.push({
        title,
        excerpt: cleanExcerpt(contentEncoded ?? description ?? content),
        imageUrl,
        sourceUrl: link,
        sourceName: source.name,
        publishedAt: pubDate ?? new Date().toISOString(),
        category: source.category,
      })

      if (items.length >= 12) break
    }

    console.log(`[RSS] ${source.name}: ${items.length} items with images`)
    return items
  } catch (error) {
    console.warn(`[RSS] Failed to fetch from ${source.name}:`, error)
    return []
  }
}

export async function fetchTechNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map((source) => fetchSingleFeed(source))
  )

  const indianNews: NewsItem[] = []
  const globalNews: NewsItem[] = []

  RSS_SOURCES.forEach((source, index) => {
    const result = results[index]
    if (result.status === 'fulfilled') {
      if (source.priority === 2) {
        indianNews.push(...result.value)
      } else {
        globalNews.push(...result.value)
      }
    }
  })

  const allNews: NewsItem[] = []
  const maxPerBatch = 4

  while (indianNews.length > 0 || globalNews.length > 0) {
    for (let i = 0; i < maxPerBatch && indianNews.length > 0; i++) {
      allNews.push(indianNews.shift()!)
    }
    for (let i = 0; i < maxPerBatch && globalNews.length > 0; i++) {
      allNews.push(globalNews.shift()!)
    }
  }

  const seen = new Set<string>()
  const deduped = allNews.filter((item) => {
    const key = item.title.toLowerCase().slice(0, 60)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  return deduped
}
