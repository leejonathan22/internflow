import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CoffeeChatPrepClient from './CoffeeChatPrepClient'
import type { Contact, PrepSession } from '@/lib/types'

export default async function CoffeeChatPrepPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [contactRes, sessionsRes] = await Promise.all([
    supabase.from('contacts').select('*').eq('id', id).single(),
    supabase
      .from('chat_prep_sessions')
      .select('*')
      .eq('contact_id', id)
      .eq('type', 'coffee_chat')
      .order('created_at', { ascending: false }),
  ])

  if (!contactRes.data) notFound()

  return (
    <CoffeeChatPrepClient
      contact={contactRes.data as Contact}
      initialSessions={(sessionsRes.data ?? []) as PrepSession[]}
    />
  )
}
