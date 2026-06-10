import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { contact_id, name, title, company, goal, background } = await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const prompt = `You are helping a student prepare for a coffee chat with a professional contact.

Contact: ${name}, ${title} at ${company}
Student background: ${background}
Goal: ${goal}

Return ONLY valid JSON, no markdown, no preamble:
{
  "questions": [],
  "talking_points": [],
  "research": [],
  "follow_up_email": ""
}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Unexpected response type')

    let output
    try {
      output = JSON.parse(content.text)
    } catch {
      const match = content.text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('Could not parse AI response')
      output = JSON.parse(match[0])
    }

    const input_json = { name, title, company, goal, background }

    const { data: session, error: dbError } = await supabase
      .from('chat_prep_sessions')
      .insert({
        user_id: user.id,
        contact_id: contact_id || null,
        type: 'coffee_chat',
        input_json,
        output_json: output,
      })
      .select()
      .single()

    if (dbError) console.error('DB save error:', dbError)

    return NextResponse.json({ output, session: session ?? null })
  } catch (err) {
    console.error('Coffee chat prep error:', err)
    return NextResponse.json({ error: 'Failed to generate prep' }, { status: 500 })
  }
}
