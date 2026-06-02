import { NextResponse } from 'next/server'
import { fetchTechNews } from '@/lib/rss/fetchTechNews'

export const revalidate = 7200

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') ?? '1')
    const perPage = 15

    const allNews = await fetchTechNews()
    const totalPages = Math.ceil(allNews.length / perPage)
    const start = (page - 1) * perPage
    const news = allNews.slice(start, start + perPage)

    return NextResponse.json(
      {
        news,
        page,
        totalPages,
        totalItems: allNews.length,
        fetchedAt: new Date().toISOString(),
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=7200, stale-while-revalidate=3600',
        },
      }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch news', news: [], page: 1, totalPages: 1, totalItems: 0 },
      { status: 500 }
    )
  }
}
