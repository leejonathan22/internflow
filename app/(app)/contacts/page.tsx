import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { RELATIONSHIP_LABELS, RELATIONSHIP_CLASSES, RELATIONSHIP_STRENGTHS } from '@/lib/utils'
import type { Contact, RelationshipStrength } from '@/lib/types'

type ContactWithApp = Contact & {
  applications: { company: string; role: string } | null
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ strength?: string }>
}) {
  const { strength } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('contacts')
    .select('*, applications(company, role)')
    .order('name')

  if (strength && (['cold', 'warm', 'hot'] as string[]).includes(strength)) {
    query = query.eq('relationship_strength', strength as RelationshipStrength)
  }

  const { data } = await query
  const contacts = (data ?? []) as ContactWithApp[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contacts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{contacts.length} total</p>
        </div>
        <Link
          href="/contacts/new"
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          + New Contact
        </Link>
      </div>

      <form method="GET" className="flex gap-2 items-center">
        <select name="strength" defaultValue={strength ?? ''} className="input-base w-auto">
          <option value="">All Relationships</option>
          {RELATIONSHIP_STRENGTHS.map((s) => (
            <option key={s} value={s}>
              {RELATIONSHIP_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="border border-gray-300 bg-white text-gray-700 text-sm px-3 py-2 rounded-md hover:bg-gray-50"
        >
          Filter
        </button>
        {strength && (
          <Link href="/contacts" className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2">
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-5 py-3 font-medium text-gray-500">Name</th>
              <th className="px-5 py-3 font-medium text-gray-500">Company / Role</th>
              <th className="px-5 py-3 font-medium text-gray-500">Relationship</th>
              <th className="px-5 py-3 font-medium text-gray-500">Linked App</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {contacts.length > 0 ? (
              contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {c.company ? (
                      <span>
                        {c.company}
                        {c.role ? ` — ${c.role}` : ''}
                      </span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${RELATIONSHIP_CLASSES[c.relationship_strength]}`}
                    >
                      {RELATIONSHIP_LABELS[c.relationship_strength]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {c.applications ? (
                      <span className="text-xs">{c.applications.company}</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/contacts/${c.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-400">
                  No contacts found.{' '}
                  <Link href="/contacts/new" className="text-indigo-600 hover:underline">
                    Add your first one.
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
