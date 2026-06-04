import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { createContact } from '@/lib/actions/contacts'
import { RELATIONSHIP_STRENGTHS, RELATIONSHIP_LABELS } from '@/lib/utils'
import { SubmitButton } from '@/components/ui/submit-button'
import type { Application } from '@/lib/types'

export default async function NewContactPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('applications')
    .select('id, company, role')
    .order('company')
  const applications = (data ?? []) as Pick<Application, 'id' | 'company' | 'role'>[]

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/contacts" className="text-sm text-gray-500 hover:text-gray-700">
          ← Contacts
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Contact</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <form action={createContact} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Jane Smith"
                className="input-base"
              />
            </div>
            <div>
              <label
                htmlFor="relationship_strength"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Relationship
              </label>
              <select
                id="relationship_strength"
                name="relationship_strength"
                defaultValue="cold"
                className="input-base"
              >
                {RELATIONSHIP_STRENGTHS.map((s) => (
                  <option key={s} value={s}>
                    {RELATIONSHIP_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                id="company"
                name="company"
                type="text"
                placeholder="Acme Corp"
                className="input-base"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Their Role
              </label>
              <input
                id="role"
                name="role"
                type="text"
                placeholder="Product Manager"
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                className="input-base"
              />
            </div>
            <div>
              <label htmlFor="linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn URL
              </label>
              <input
                id="linkedin"
                name="linkedin"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="application_id"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Linked Application
            </label>
            <select id="application_id" name="application_id" className="input-base">
              <option value="">None</option>
              {applications.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.company} — {a.role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              placeholder="How you know them, context..."
              className="input-base"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <SubmitButton label="Create Contact" loadingLabel="Saving..." />
            <Link
              href="/contacts"
              className="border border-gray-300 text-gray-600 text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
