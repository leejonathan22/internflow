import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteApplication } from '@/lib/actions/applications'
import { createInteraction, deleteInteraction } from '@/lib/actions/interactions'
import { createReminder, toggleReminder, deleteReminder } from '@/lib/actions/reminders'
import { DeleteButton } from '@/components/ui/delete-button'
import {
  STATUS_LABELS,
  STATUS_CLASSES,
  INTERACTION_TYPES,
  INTERACTION_LABELS,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_CLASSES,
  formatDate,
  isOverdue,
} from '@/lib/utils'
import type { Application, Contact, Interaction, Reminder } from '@/lib/types'

type InteractionWithContact = Interaction & {
  contacts: { id: string; name: string } | null
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [appRes, contactsRes, interactionsRes, remindersRes] = await Promise.all([
    supabase.from('applications').select('*').eq('id', id).single(),
    supabase.from('contacts').select('*').eq('application_id', id).order('name'),
    supabase
      .from('interactions')
      .select('*, contacts(id, name)')
      .eq('application_id', id)
      .order('date', { ascending: false }),
    supabase.from('reminders').select('*').eq('application_id', id).order('due_date'),
  ])

  if (!appRes.data) notFound()

  const app = appRes.data as Application
  const contacts = (contactsRes.data ?? []) as Contact[]
  const interactions = (interactionsRes.data ?? []) as InteractionWithContact[]
  const reminders = (remindersRes.data ?? []) as Reminder[]

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Breadcrumb + Actions */}
      <div className="flex items-start justify-between">
        <div>
          <Link href="/applications" className="text-sm text-gray-500 hover:text-gray-700">
            ← Applications
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{app.company}</h1>
          <p className="text-gray-500 mt-0.5">{app.role}</p>
        </div>

        <div className="flex gap-2 mt-1">
          <Link
            href={`/applications/${id}/interview-prep`}
            className="border border-indigo-300 bg-indigo-50 text-indigo-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-100 transition-colors"
          >
            Interview Prep
          </Link>
          <Link
            href={`/applications/${id}/edit`}
            className="border border-gray-300 bg-white text-gray-700 text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            Edit
          </Link>
          <DeleteButton
            formAction={deleteApplication.bind(null, id)}
            confirmMessage="Delete this application?"
          />
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Status</p>
            <span
              className={`mt-1.5 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[app.status]}`}
            >
              {STATUS_LABELS[app.status]}
            </span>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Applied</p>
            <p className="mt-1.5 text-sm text-gray-800">{formatDate(app.applied_date)}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Added</p>
            <p className="mt-1.5 text-sm text-gray-800">{formatDate(app.created_at)}</p>
          </div>
        </div>

        {app.url && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              Job Posting
            </p>
            <a
              href={app.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-600 hover:underline break-all"
            >
              {app.url}
            </a>
          </div>
        )}

        {app.notes && (
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
              Notes
            </p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{app.notes}</p>
          </div>
        )}
      </div>

      {/* Linked Contacts */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Linked Contacts</h2>
          <Link
            href={`/contacts/new`}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Add Contact
          </Link>
        </div>

        {contacts.length > 0 ? (
          <ul className="divide-y divide-gray-100 -mx-1">
            {contacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-3 px-1 gap-3">
                <div>
                  <Link
                    href={`/contacts/${c.id}`}
                    className="text-sm font-medium text-gray-900 hover:text-indigo-600"
                  >
                    {c.name}
                  </Link>
                  {c.role && (
                    <p className="text-xs text-gray-500 mt-0.5">{c.role}</p>
                  )}
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${RELATIONSHIP_CLASSES[c.relationship_strength]}`}
                >
                  {RELATIONSHIP_LABELS[c.relationship_strength]}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-400">
            No contacts linked.{' '}
            <Link href="/contacts/new" className="text-indigo-600 hover:underline">
              Add one.
            </Link>
          </p>
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
                    {ix.contacts && (
                      <Link
                        href={`/contacts/${ix.contacts.id}`}
                        className="text-xs text-indigo-500 hover:underline"
                      >
                        {ix.contacts.name}
                      </Link>
                    )}
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
          <input type="hidden" name="application_id" value={id} />
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
          <input type="hidden" name="application_id" value={id} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
              <input
                name="title"
                type="text"
                required
                placeholder="Send thank-you email..."
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
