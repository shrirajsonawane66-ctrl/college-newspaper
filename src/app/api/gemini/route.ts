import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const { message, articleContext } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const novaSystemPrompt = `You are NOVA, an advanced AI news anchor and assistant for WCCBM Timeline — a college newspaper website.

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

    let contextPrompt = ''
    if (articleContext?.title) {
      contextPrompt = `
CURRENT ARTICLE CONTEXT:
Title: ${articleContext.title}
Summary: ${articleContext.summary ?? 'N/A'}
Source: ${articleContext.source ?? 'N/A'}
${articleContext.content ? `Excerpt: ${articleContext.content.slice(0, 500)}` : ''}`
    }

    const prompt = `${novaSystemPrompt}\n${contextPrompt}\n\nUSER: ${message}\n\nNOVA:`
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent(prompt)
    const text = result.response.text() || '...'

    return NextResponse.json({ reply: text })
  } catch (error) {
    console.error('Gemini API error:', error)
    return NextResponse.json({ reply: "I'm sorry, my AI service is temporarily unavailable due to high demand. Please try again in a minute or check your Gemini API plan." })
  }
}
