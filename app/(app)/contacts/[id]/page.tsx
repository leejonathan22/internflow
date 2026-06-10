import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteContact } from '@/lib/actions/contacts'
import { createInteraction, deleteInteraction } from '@/lib/actions/interactions'
import { createReminder, toggleReminder, deleteReminder } from '@/lib/actions/reminders'
import { DeleteButton } from '@/components/ui/delete-button'
import {
  RELATIONSHIP_LABELS,
  RELATIONSHIP_CLASSES,
  INTERACTION_TYPES,
  INTERACTION_LABELS,
  formatDate,
  isOverdue,
} from '@/lib/utils'
import type { Contact, Interaction, Reminder, Application } from '@/lib/types'

type ContactWithApp = Contact & {
  applications: Pick<Application, 'id' | 'company' | 'role'> | null
}

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [contactRes, interactionsRes, remindersRes] = await Promise.all([
    supabase
      .from('contacts')
      .select('*, applications(id, company, role)')
      .eq('id', id)
      .single(),
    supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', id)
      .order('date', { ascending: false }),
    supabase.from('reminders').select('*').eq('contact_id', id).order('due_date'),
  ])

  if (!contactRes.data) notFound()

  const contact = contactRes.data as ContactWithApp
  const interactions = (interactionsRes.data ?? []) as Interaction[]
  const reminders = (remindersRes.data ?? []) as Reminder[]

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/contacts" className="text-sm text-gray-500 hover:text-gray-700">
            ← Contacts
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{contact.name}</h1>
          {contact.company && (
            <p className="text-gray-500 mt-0.5">
              {contact.company}
              {contact.role ? ` — ${contact.role}` : ''}
            </p>
          )}
        </div>
        <div className="flex gap-2 mt-1">
          <Link
            href={`/contacts/${id}/prep`}
            className="border border-indigo-300 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors"
          >
            Prep
          </Link>
          <Link
            href={`/contacts/${id}/edit`}
            className="border border-gray-300 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton
            formAction={deleteContact.bind(null, id)}
            confirmMessage="Delete this contact?"
          />
        </div>
      </div>

      {/* Info card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <div>
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${RELATIONSHIP_CLASSES[contact.relationship_strength]}`}
          >
            {RELATIONSHIP_LABELS[contact.relationship_strength]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {contact.email && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Email</p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-1 text-sm text-indigo-600 hover:underline block"
              >
                {contact.email}
              </a>
            </div>
          )}
          {contact.linkedin && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">LinkedIn</p>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-indigo-600 hover:underline block"
              >
                View Profile →
              </a>
            </div>
          )}
          {contact.applications && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Linked App
              </p>
              <Link
                href={`/applications/${contact.applications.id}`}
                className="mt-1 text-sm text-indigo-600 hover:underline block"
              >
                {contact.applications.company}
              </Link>
            </div>
          )}
        </div>

        {contact.notes && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{contact.notes}</p>
          </div>
        )}
      </div>

      {/* Interactions */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Interactions</h2>

        {interactions.length > 0 ? (
          <ul className="divide-y divide-gray-100 -mx-1">
            {interactions.map((ix) => (
              <li key={ix.id} className="flex items-start justify-between py-3 px-1 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full px-2 py-0.5">
                      {INTERACTION_LABELS[ix.type]}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(ix.date)}</span>
                  </div>
                  {ix.notes && <p className="text-sm text-gray-600 mt-1">{ix.notes}</p>}
                </div>
                <form action={deleteInteraction.bind(null, ix.id)}>
                  <button type="submit" className="text-xs text-red-400 hover:text-red-600 shrink-0">
                    Remove
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No interactions logged yet.</p>
        )}

        <form action={createInteraction} className="border-t border-gray-100 pt-4 space-y-3">
          <input type="hidden" name="contact_id" value={id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <select name="type" className="input-base text-xs py-1.5">
                {INTERACTION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {INTERACTION_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={today}
                className="input-base text-xs py-1.5"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <input
              name="notes"
              type="text"
              placeholder="What happened..."
              className="input-base text-xs py-1.5"
            />
          </div>
          <button
            type="submit"
            className="text-xs bg-indigo-600 text-white font-medium px-4 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Log Interaction
          </button>
        </form>
      </div>

      {/* Reminders */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Reminders</h2>

        {reminders.length > 0 ? (
          <ul className="divide-y divide-gray-100 -mx-1">
            {reminders.map((r) => {
              const overdue = !r.done && isOverdue(r.due_date)
              return (
                <li key={r.id} className="flex items-center justify-between py-3 px-1 gap-3">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <form action={toggleReminder.bind(null, r.id, r.done)}>
                      <button
                        type="submit"
                        title={r.done ? 'Mark undone' : 'Mark done'}
                        className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                          r.done
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'border-gray-300 hover:border-indigo-400'
                        }`}
                      >
                        {r.done && <span className="text-[10px] leading-none">✓</span>}
                      </button>
                    </form>
                    <span
                      className={`text-sm truncate ${
                        r.done
                          ? 'line-through text-gray-400'
                          : overdue
                          ? 'text-red-600 font-medium'
                          : 'text-gray-700'
                      }`}
                    >
                      {r.title}
                    </span>
                    <span
                      className={`text-xs shrink-0 ${
                        overdue && !r.done ? 'text-red-500' : 'text-gray-400'
                      }`}
                    >
                      {formatDate(r.due_date)}
                    </span>
                  </div>
                  <form action={deleteReminder.bind(null, r.id)}>
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600 shrink-0">
                      Remove
                    </button>
                  </form>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">No reminders set.</p>
        )}

        <form action={createReminder} className="border-t border-gray-100 pt-4 space-y-3">
          <input type="hidden" name="contact_id" value={id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                name="title"
                type="text"
                required
                placeholder="Follow up..."
                className="input-base text-xs py-1.5"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
              <input
                name="due_date"
                type="date"
                required
                className="input-base text-xs py-1.5"
              />
            </div>
          </div>
          <button
            type="submit"
            className="text-xs bg-indigo-600 text-white font-medium px-4 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add Reminder
          </button>
        </form>
      </div>
    </div>
  )
}
