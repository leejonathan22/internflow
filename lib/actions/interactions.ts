'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { InteractionType } from '@/lib/types'

export async function createInteraction(formData: FormData) {
  const supabase = await createClient()
  const applicationId = (formData.get('application_id') as string) || null
  const contactId = (formData.get('contact_id') as string) || null
  const { error } = await supabase.from('interactions').insert({
    date: formData.get('date') as string,
    type: formData.get('type') as InteractionType,
    notes: (formData.get('notes') as string).trim() || null,
    contact_id: contactId,
    application_id: applicationId,
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
