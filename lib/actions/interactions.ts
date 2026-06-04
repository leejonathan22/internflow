'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InteractionType } from '@/lib/types'

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export async function createInteraction(formData: FormData) {
  const supabase = await createClient()
  const user_id = await getUserId(supabase)
  const applicationId = (formData.get('application_id') as string) || null
  const contactId = (formData.get('contact_id') as string) || null
  const { error } = await supabase.from('interactions').insert({
    date: formData.get('date') as string,
    type: formData.get('type') as InteractionType,
    notes: (formData.get('notes') as string).trim() || null,
    contact_id: contactId,
    application_id: applicationId,
    user_id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  if (applicationId) revalidatePath(`/applications/${applicationId}`)
  if (contactId) revalidatePath(`/contacts/${contactId}`)
}

export async function deleteInteraction(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('interactions').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/applications', 'layout')
  revalidatePath('/contacts', 'layout')
}
