'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { AppStatus } from '@/lib/types'

function parseForm(formData: FormData) {
  return {
    company: (formData.get('company') as string).trim(),
    role: (formData.get('role') as string).trim(),
    status: formData.get('status') as AppStatus,
    applied_date: (formData.get('applied_date') as string) || null,
    url: (formData.get('url') as string).trim() || null,
    notes: (formData.get('notes') as string).trim() || null,
  }
}

async function getUserId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  return user.id
}

export async function createApplication(formData: FormData) {
  const supabase = await createClient()
  const user_id = await getUserId(supabase)

  const { data, error } = await supabase
    .from('applications')
    .insert({ ...parseForm(formData), user_id })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/applications')
  redirect(`/applications/${data.id}`)
}

export async function updateApplication(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('applications')
    .update(parseForm(formData))
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/applications')
  revalidatePath(`/applications/${id}`)
  redirect(`/applications/${id}`)
}

export async function deleteApplication(id: string) {
  const supabase = await createClient()

  const { error } = await supabase.from('applications').delete().eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/applications')
  redirect('/applications')
}
