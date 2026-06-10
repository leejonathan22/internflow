import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { application_id, company, role, interview_type, job_description, background } =
      await req.json()

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const prompt = `You are helping a student prepare for a PM internship interview.

Company: ${company}
Role: ${role}
Interview type: ${interview_type}
Job description: ${job_description || 'Not provided'}
Student background: ${background}

Return ONLY valid JSON, no markdown, no preamble:
{
  "questions": [],
  "star_prompts": [],
  "themes": [],
  "elevator_pitch": ""
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

    const input_json = { company, role, interview_type, job_description: job_description || '', background }

    const { data: session, error: dbError } = await supabase
      .from('chat_prep_sessions')
      .insert({
        user_id: user.id,
        application_id: application_id || null,
        type: 'interview',
        input_json,
        output_json: output,
      })
      .select()
      .single()

    if (dbError) console.error('DB save error:', dbError)

    return NextResponse.json({ output, session: session ?? null })
  } catch (err) {
    console.error('Interview prep error:', err)
    return NextResponse.json({ error: 'Failed to generate prep' }, { status: 500 })
  }
}
