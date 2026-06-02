export function startViewTransition(update: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    const doc = document as Document & { startViewTransition: (cb: () => void) => void }
    return doc.startViewTransition(update)
  }
  update()
}
