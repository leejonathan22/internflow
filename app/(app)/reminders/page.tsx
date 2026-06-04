import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { createReminder, toggleReminder, deleteReminder } from '@/lib/actions/reminders'
import { formatDate, isOverdue } from '@/lib/utils'
import type { Reminder } from '@/lib/types'

type ReminderWithRefs = Reminder & {
  contacts: { id: string; name: string } | null
  applications: { id: string; company: string; role: string } | null
}

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('reminders')
    .select('*, contacts(id, name), applications(id, company, role)')
    .order('due_date')

  if (filter === 'pending') query = query.eq('done', false)
  if (filter === 'done') query = query.eq('done', true)

  const { data } = await query
  const reminders = (data ?? []) as ReminderWithRefs[]

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="text-sm text-gray-500 mt-0.5">{reminders.length} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5">
        {[
          { label: 'All', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Done', value: 'done' },
        ].map(({ label, value }) => {
          const active = (filter ?? '') === value
          return (
            <Link
              key={value}
              href={value ? `/reminders?filter=${value}` : '/reminders'}
              className={`px-3 py-1.5 text-sm rounded-md font-medium transition-colors ${
                active
                  ? 'bg-indigo-600 text-white'
                  : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {/* Add reminder form */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <p className="text-sm font-semibold text-gray-700 mb-3">New Reminder</p>
        <form action={createReminder} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
            <input
              name="title"
              type="text"
              required
              placeholder="Follow up with recruiter..."
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Due Date</label>
            <input
              name="due_date"
              type="date"
              required
              defaultValue={today}
              className="input-base"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm divide-y divide-gray-100">
        {reminders.length > 0 ? (
          reminders.map((r) => {
            const overdue = !r.done && isOverdue(r.due_date)
            return (
              <div key={r.id} className="flex items-center gap-3 px-5 py-4">
                <form action={toggleReminder.bind(null, r.id, r.done)}>
                  <button
                    type="submit"
                    title={r.done ? 'Mark undone' : 'Mark done'}
                    className={`w-5 h-5 rounded border shrink-0 flex items-center justify-center transition-colors ${
                      r.done
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'border-gray-300 hover:border-indigo-400'
                    }`}
                  >
                    {r.done && <span className="text-[11px] leading-none">✓</span>}
                  </button>
                </form>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      r.done
                        ? 'line-through text-gray-400'
                        : overdue
                        ? 'text-red-600'
                        : 'text-gray-800'
                    }`}
                  >
                    {r.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <span
                      className={`text-xs ${
                        overdue && !r.done ? 'text-red-500 font-medium' : 'text-gray-400'
                      }`}
                    >
                      {overdue && !r.done ? 'Overdue · ' : ''}
                      {formatDate(r.due_date)}
                    </span>
                    {r.contacts && (
                      <Link
                        href={`/contacts/${r.contacts.id}`}
                        className="text-xs text-indigo-500 hover:underline"
                      >
                        {r.contacts.name}
                      </Link>
                    )}
                    {r.applications && (
                      <Link
                        href={`/applications/${r.applications.id}`}
                        className="text-xs text-indigo-500 hover:underline"
                      >
                        {r.applications.company}
                      </Link>
                    )}
                  </div>
                </div>

                <form action={deleteReminder.bind(null, r.id)}>
                  <button
                    type="submit"
                    className="text-xs text-red-400 hover:text-red-600 shrink-0"
                  >
                    Remove
                  </button>
                </form>
              </div>
            )
          })
        ) : (
          <div className="px-5 py-12 text-center text-gray-400 text-sm">
            {filter === 'pending' ? 'No pending reminders.' : filter === 'done' ? 'No completed reminders.' : 'No reminders yet.'}
          </div>
        )}
      </div>
    </div>
  )
}
