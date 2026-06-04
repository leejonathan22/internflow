'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export async function createReminder(formData: FormData) {
  const supabase = await createClient()
  const user_id = await getUserId(supabase)
  const applicationId = (formData.get('application_id') as string) || null
  const contactId = (formData.get('contact_id') as string) || null
  const { error } = await supabase.from('reminders').insert({
    title: (formData.get('title') as string).trim(),
    due_date: formData.get('due_date') as string,
    contact_id: contactId,
    application_id: applicationId,
    user_id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/reminders')
  revalidatePath('/dashboard')
  if (applicationId) revalidatePath(`/applications/${applicationId}`)
  if (contactId) revalidatePath(`/contacts/${contactId}`)
}

export async function toggleReminder(id: string, done: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('reminders').update({ done: !done }).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/reminders')
  revalidatePath('/dashboard')
  revalidatePath('/applications', 'layout')
  revalidatePath('/contacts', 'layout')
}

export async function deleteReminder(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('reminders').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/reminders')
  revalidatePath('/dashboard')
  revalidatePath('/applications', 'layout')
  revalidatePath('/contacts', 'layout')
}
