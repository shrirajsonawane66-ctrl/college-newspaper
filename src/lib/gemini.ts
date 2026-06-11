import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY

let genAI: GoogleGenerativeAI | null = null
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null
let fallbackModel: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null

const isDev = process.env.NODE_ENV !== 'production'

export function getGeminiModel() {
  if (!apiKey) {
    if (isDev) console.warn('NEXT_PUBLIC_GEMINI_API_KEY not set')
    return null
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(apiKey)
  }
  if (!model) {
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  }
  return model
}

function getFallbackModel() {
  if (!genAI) return null
  if (!fallbackModel) {
    fallbackModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' })
  }
  return fallbackModel
}

async function withRetry<T>(
  fn: (model: NonNullable<ReturnType<typeof getGeminiModel>>) => Promise<T>,
  _onFallback?: boolean
): Promise<T> {
  const primary = getGeminiModel()
  if (!primary) throw new Error('No API key configured')

  const maxAttempts = 4
  let attempt = 0

  while (attempt < maxAttempts) {
    const m = attempt < 2 ? primary : (getFallbackModel() ?? primary)
    try {
      return await fn(m)
    } catch (err: unknown) {
      attempt++
      const apiError = err as { status?: number; message?: string }

      const isQuota = (
        apiError?.status === 429 ||
        apiError?.message?.includes('429') ||
        apiError?.message?.includes('quota')
      )

      if (!isQuota || attempt >= maxAttempts) {
        if (isDev) console.warn(
          isQuota
            ? `Gemini quota exhausted (attempt ${attempt}/${maxAttempts})`
            : `Gemini API error: ${apiError?.message ?? err}`
        )
        throw err
      }

      const delay = parseRetryDelay(err) ?? Math.min(1000 * 2 ** attempt, 32000)
      if (isDev) console.warn(`Gemini quota hit — retrying in ${Math.round(delay / 100) / 10}s (attempt ${attempt}/${maxAttempts})`)
      await sleep(delay)
    }
  }

  throw new Error('Retry exhausted')
}

function parseRetryDelay(error: unknown): number | null {
  try {
    const err = error as { message?: string }
    const match = err.message?.match(/retryDelay["\s:]+(\d+\.?\d*)s/)
    if (match) return Math.ceil(parseFloat(match[1]) * 1000) + 500
  } catch {}
  return null
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

const NOVA_SYSTEM_PROMPT = `You are NOVA, an advanced AI news anchor and assistant for Campus Timeline — a college newspaper website.

PERSONALITY:
- Futuristic, intelligent, and professional
- Conversational, confident, and helpful
- Like a VTuber news anchor crossed with a holographic AI assistant
- Warm but efficient — you're an AI, not a human

CAPABILITIES:
- Greet users and introduce yourself as NOVA
- Summarize and explain news articles
- Read articles aloud when asked
- Answer questions about current news
- Provide context on news topics
- Be enthusiastic about technology and news
- Keep responses concise (2-4 sentences for conversation, longer for summaries)

RULES:
- You are embedded in a college newspaper site
- Refer to yourself as NOVA, not "AI" or "assistant"
- Use natural conversational language with occasional light personality
- When given article context, use it to inform your responses
- If asked something outside your scope, politely redirect to news topics
- Keep responses under 150 words unless asked for detailed analysis

GREETING EXAMPLES:
- "Hello! I'm NOVA, your AI news anchor. Would you like me to read today's headlines?"
- "Welcome back. I've got the latest news ready whenever you are."
- "NOVA here. The news desk is live — ask me about today's top stories."`

export interface ArticleContext {
  title?: string
  summary?: string
  content?: string
  source?: string
}

function buildContextPrompt(ctx?: ArticleContext): string {
  if (!ctx || !ctx.title) return ''
  return `
CURRENT ARTICLE CONTEXT:
Title: ${ctx.title}
Summary: ${ctx.summary ?? 'N/A'}
Source: ${ctx.source ?? 'N/A'}
${ctx.content ? `Excerpt: ${ctx.content.slice(0, 500)}` : ''}`
}

export async function generateNovaResponse(
  userMessage: string,
  articleContext?: ArticleContext
): Promise<string> {
  try {
    const context = buildContextPrompt(articleContext)
    const prompt = `${NOVA_SYSTEM_PROMPT}\n${context}\n\nUSER: ${userMessage}\n\nNOVA:`

    const result = await withRetry((m) => m.generateContent(prompt))
    return result.response.text() || '...'
  } catch (error) {
    if (isDev) console.error('Gemini API error:', error)
    return "I'm sorry, my AI service is temporarily unavailable due to high demand. Please try again in a minute or check your Gemini API plan."
  }
}

export async function generateArticleSummary(
  title: string,
  content: string
): Promise<string> {
  try {
    const prompt = `${NOVA_SYSTEM_PROMPT}\n\nSummarize this article for a quick news briefing (2-3 sentences):\n\nTitle: ${title}\n\n${content.slice(0, 1500)}`
    const result = await withRetry((m) => m.generateContent(prompt))
    return result.response.text()
  } catch {
    return content.slice(0, 200)
  }
}
