export function startViewTransition(update: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    return (document as any).startViewTransition(update)
  }
  update()
}
