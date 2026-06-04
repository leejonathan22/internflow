'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { RelationshipStrength } from '@/lib/types'

function parseForm(formData: FormData) {
  return {
    name: (formData.get('name') as string).trim(),
    email: (formData.get('email') as string).trim() || null,
    linkedin: (formData.get('linkedin') as string).trim() || null,
    company: (formData.get('company') as string).trim() || null,
    role: (formData.get('role') as string).trim() || null,
    relationship_strength: formData.get('relationship_strength') as RelationshipStrength,
    notes: (formData.get('notes') as string).trim() || null,
    application_id: (formData.get('application_id') as string) || null,
  }
}

export async function createContact(formData: FormData) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('contacts')
    .insert(parseForm(formData))
    .select('id')
    .single()
  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
  redirect(`/contacts/${data.id}`)
}

export async function updateContact(id: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').update(parseForm(formData)).eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
  revalidatePath(`/contacts/${id}`)
  redirect(`/contacts/${id}`)
}

export async function deleteContact(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('contacts').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/contacts')
  redirect('/contacts')
}
