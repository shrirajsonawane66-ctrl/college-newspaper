const STORAGE_KEY = 'campus_visited_sections'

export function markSectionAsRead(section: string) {
  const visited = getVisitedSections()
  visited[section.toLowerCase()] = new Date().toISOString()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(visited))
}

export function getVisitedSections(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

export function hasSectionUnread(section: string, latestArticleDate: string): boolean {
  if (!latestArticleDate) return false
  const visited = getVisitedSections()
  const lastVisited = visited[section.toLowerCase()]
  if (!lastVisited) return true
  return new Date(latestArticleDate) > new Date(lastVisited)
}
