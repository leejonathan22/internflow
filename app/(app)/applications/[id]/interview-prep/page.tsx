import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import InterviewPrepClient from './InterviewPrepClient'
import type { Application, PrepSession } from '@/lib/types'

export default async function InterviewPrepPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [appRes, sessionsRes] = await Promise.all([
    supabase.from('applications').select('*').eq('id', id).single(),
    supabase
      .from('chat_prep_sessions')
      .select('*')
      .eq('application_id', id)
      .eq('type', 'interview')
      .order('created_at', { ascending: false }),
  ])

  if (!appRes.data) notFound()

  return (
    <InterviewPrepClient
      application={appRes.data as Application}
      initialSessions={(sessionsRes.data ?? []) as PrepSession[]}
    />
  )
}
