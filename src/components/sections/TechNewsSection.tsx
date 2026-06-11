'use client'
import { useState, useCallback } from 'react'
import type { NewsItem } from '@/lib/rss/fetchTechNews'

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function NewsCard({ item, size }: { item: NewsItem; size: 'large' | 'medium' | 'small' }) {
  if (size === 'large') {
    return (
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      >
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%',
              height: '320px',
              objectFit: 'cover',
              display: 'block',
              marginBottom: '16px',
            }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <span style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '10px',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: '#e63946',
          }}>{item.sourceName}</span>
          <span style={{ color: '#ddd' }}>·</span>
          <span style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            color: '#999',
          }}>{timeAgo(item.publishedAt)}</span>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(22px, 2.5vw, 32px)',
          fontWeight: '700',
          lineHeight: '1.2',
          color: '#1a1a1a',
          margin: '0 0 10px 0',
        }}>{item.title}</h2>
        {item.excerpt && (
          <p style={{
            fontFamily: 'var(--font-source-serif)',
            fontSize: '15px',
            lineHeight: '1.6',
            color: '#555',
            margin: '0',
          }}>{item.excerpt}</p>
        )}
      </a>
    )
  }

  if (size === 'medium') {
    return (
      <a
        href={item.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
            <span style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '10px',
              fontWeight: '700',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: '#e63946',
            }}>{item.sourceName}</span>
            <span style={{ color: '#ddd' }}>·</span>
            <span style={{
              fontFamily: 'var(--font-inter)',
              fontSize: '10px',
              color: '#999',
            }}>{timeAgo(item.publishedAt)}</span>
          </div>
          <h3 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '15px',
            fontWeight: '700',
            lineHeight: '1.3',
            color: '#1a1a1a',
            margin: '0',
          }}>{item.title}</h3>
        </div>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.title}
            loading="lazy"
            decoding="async"
            style={{ width: '80px', height: '60px', objectFit: 'cover', flexShrink: 0 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        )}
      </a>
    )
  }

  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
        <span style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '9px',
          fontWeight: '700',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          color: '#e63946',
        }}>{item.sourceName}</span>
        <span style={{ color: '#ddd' }}>·</span>
        <span style={{
          fontFamily: 'var(--font-inter)',
          fontSize: '10px',
          color: '#999',
        }}>{timeAgo(item.publishedAt)}</span>
      </div>
      <h4 style={{
        fontFamily: 'var(--font-playfair)',
        fontSize: '14px',
        fontWeight: '700',
        lineHeight: '1.35',
        color: '#1a1a1a',
        margin: '0',
      }}>{item.title}</h4>
    </a>
  )
}

interface TechNewsSectionProps {
  initialNews: NewsItem[]
  initialPage?: number
  initialTotalPages?: number
}

export function TechNewsSection({
  initialNews,
  initialPage = 1,
  initialTotalPages = 4,
}: TechNewsSectionProps) {
  const [news, setNews] = useState<NewsItem[]>(initialNews)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [totalPages, setTotalPages] = useState(initialTotalPages)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState(new Date())

  const fetchPage = useCallback(async (page: number, forceRefresh = false) => {
    const url = `/api/tech-news?page=${page}${forceRefresh ? '&refresh=true' : ''}`
    const res = await fetch(url, { cache: forceRefresh ? 'no-store' : 'default' })
    const data = await res.json()
    return data
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchPage(1, true)
      setNews(data.news ?? [])
      setCurrentPage(1)
      setTotalPages(data.totalPages ?? 4)
      setLastRefreshed(new Date())
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('Refresh failed:', e)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handlePageChange = async (page: number) => {
    if (page === currentPage) return
    setIsLoadingPage(true)
    window.scrollTo({ top: document.getElementById('tech-news-section')?.offsetTop ?? 0, behavior: 'smooth' })
    try {
      const data = await fetchPage(page)
      setNews(data.news ?? [])
      setCurrentPage(page)
      setTotalPages(data.totalPages ?? 4)
    } catch (e) {
      if (process.env.NODE_ENV !== 'production') console.error('Page load failed:', e)
    } finally {
      setIsLoadingPage(false)
    }
  }

  if (!news || news.length === 0) return null

  const featured = news[0]
  const sideStories = news.slice(1, 5)
  const gridStories = news.slice(5, 9)
  const listStories = news.slice(9, 15)

  return (
    <section
      id="tech-news-section"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px 64px',
        backgroundColor: '#ffffff',
        opacity: isLoadingPage ? 0.5 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      <div style={{
        borderTop: '3px solid #1a1a1a',
        borderBottom: '1px solid #e2e2e2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 0',
        marginBottom: '28px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '3px',
            textTransform: 'uppercase',
            color: '#1a1a1a',
          }}>Tech News</span>
          <span style={{
            backgroundColor: '#e63946',
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: '700',
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            padding: '2px 6px',
            borderRadius: '2px',
          }}>Live</span>
          <span style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            color: '#999',
          }}>
            Page {currentPage} of {totalPages}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{
            fontFamily: 'var(--font-inter)',
            fontSize: '11px',
            color: '#999',
          }}>
            {isRefreshing ? 'Refreshing...' : `Updated ${timeAgo(lastRefreshed.toISOString())}`}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              border: '1px solid #1a1a1a',
              borderRadius: '2px',
              backgroundColor: isRefreshing ? '#f5f5f5' : '#ffffff',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--font-inter)',
              fontSize: '11px',
              fontWeight: '600',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              color: isRefreshing ? '#999' : '#1a1a1a',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{
              display: 'inline-block',
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
            }}>↻</span>
            {isRefreshing ? 'Loading...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="main-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '0',
        marginBottom: '32px',
        borderBottom: '1px solid #e2e2e2',
        paddingBottom: '32px',
      }}>
        <div style={{ paddingRight: '32px', borderRight: '1px solid #e2e2e2' }}>
          <NewsCard item={featured} size="large" />
        </div>
        <div style={{ paddingLeft: '32px', display: 'flex', flexDirection: 'column', gap: '0' }}>
          {sideStories.map((item, i) => (
            <div
              key={item.sourceUrl + item.title}
              style={{
                borderBottom: i < sideStories.length - 1 ? '1px solid #e2e2e2' : 'none',
                paddingBottom: i < sideStories.length - 1 ? '16px' : '0',
                marginBottom: i < sideStories.length - 1 ? '16px' : '0',
              }}
            >
              <NewsCard item={item} size="medium" />
            </div>
          ))}
        </div>
      </div>

      {gridStories.length > 0 && (
        <div className="four-col" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '0',
          marginBottom: '32px',
          borderBottom: '1px solid #e2e2e2',
          paddingBottom: '32px',
        }}>
          {gridStories.map((item, i) => (
            <div
              key={item.sourceUrl + item.title}
              style={{
                paddingLeft: i > 0 ? '24px' : '0',
                paddingRight: i < gridStories.length - 1 ? '24px' : '0',
                borderRight: i < gridStories.length - 1 ? '1px solid #e2e2e2' : 'none',
              }}
            >
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                {item.imageUrl && (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '140px',
                      objectFit: 'cover',
                      marginBottom: '10px',
                    }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                )}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '5px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '9px',
                    fontWeight: '700',
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    color: '#e63946',
                  }}>{item.sourceName}</span>
                  <span style={{ color: '#ddd' }}>·</span>
                  <span style={{
                    fontFamily: 'var(--font-inter)',
                    fontSize: '10px',
                    color: '#999',
                  }}>{timeAgo(item.publishedAt)}</span>
                </div>
                <h3 style={{
                  fontFamily: 'var(--font-playfair)',
                  fontSize: '15px',
                  fontWeight: '700',
                  lineHeight: '1.3',
                  color: '#1a1a1a',
                  margin: '0',
                }}>{item.title}</h3>
              </a>
            </div>
          ))}
        </div>
      )}

      {listStories.length > 0 && (
        <div className="three-col" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0',
          marginBottom: '32px',
          borderBottom: '1px solid #e2e2e2',
          paddingBottom: '32px',
        }}>
          {listStories.map((item, i) => (
            <div
              key={item.sourceUrl + item.title}
              style={{
                padding: '16px',
                paddingLeft: i % 3 === 0 ? '0' : '16px',
                paddingRight: i % 3 === 2 ? '0' : '16px',
                borderRight: i % 3 < 2 ? '1px solid #e2e2e2' : 'none',
                borderBottom: i < listStories.length - 3 ? '1px solid #e2e2e2' : 'none',
              }}
            >
              <NewsCard item={item} size="small" />
            </div>
          ))}
        </div>
      )}

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        paddingTop: '8px',
      }}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoadingPage}
          style={{
            padding: '8px 16px',
            border: '1px solid #e2e2e2',
            borderRadius: '2px',
            backgroundColor: '#ffffff',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            color: currentPage === 1 ? '#ccc' : '#1a1a1a',
          }}
        >← Prev</button>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={isLoadingPage}
            style={{
              padding: '8px 14px',
              border: '1px solid',
              borderColor: currentPage === page ? '#1a1a1a' : '#e2e2e2',
              borderRadius: '2px',
              backgroundColor: currentPage === page ? '#1a1a1a' : '#ffffff',
              cursor: 'pointer',
              fontFamily: 'var(--font-inter)',
              fontSize: '12px',
              fontWeight: currentPage === page ? '700' : '400',
              color: currentPage === page ? '#ffffff' : '#1a1a1a',
              transition: 'all 0.15s ease',
            }}
          >{page}</button>
        ))}

        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoadingPage}
          style={{
            padding: '8px 16px',
            border: '1px solid #e2e2e2',
            borderRadius: '2px',
            backgroundColor: '#ffffff',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-inter)',
            fontSize: '12px',
            color: currentPage === totalPages ? '#ccc' : '#1a1a1a',
          }}
        >Next →</button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          #tech-news-section .main-grid { grid-template-columns: 1fr !important; }
          #tech-news-section .four-col { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          #tech-news-section .four-col { grid-template-columns: 1fr !important; }
          #tech-news-section .three-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  )
}
