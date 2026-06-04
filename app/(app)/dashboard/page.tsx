import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { STATUS_LABELS, STATUS_CLASSES, APP_STATUSES, INTERACTION_LABELS, formatDate, isOverdue } from '@/lib/utils'
import type { Application, Interaction, Reminder } from '@/lib/types'

async function getData(supabase: Awaited<ReturnType<typeof createClient>>) {
  const [apps, contacts, reminders, recentInteractions, upcomingReminders] = await Promise.all([
    supabase.from('applications').select('status'),
    supabase.from('contacts').select('id', { count: 'exact', head: true }),
    supabase
      .from('reminders')
      .select('id', { count: 'exact', head: true })
      .eq('done', false),
    supabase
      .from('interactions')
      .select('*, contacts(id, name), applications(id, company)')
      .order('date', { ascending: false })
      .limit(5),
    supabase
      .from('reminders')
      .select('*, contacts(id, name), applications(id, company)')
      .eq('done', false)
      .order('due_date')
      .limit(5),
  ])

  const appList = (apps.data ?? []) as Pick<Application, 'status'>[]
  return {
    stats: {
      total: appList.length,
      interviews: appList.filter((a) => a.status === 'interview').length,
      offers: appList.filter((a) => a.status === 'offer').length,
      contacts: contacts.count ?? 0,
      reminders: reminders.count ?? 0,
      byStatus: Object.fromEntries(
        APP_STATUSES.map((s) => [s, appList.filter((a) => a.status === s).length])
      ),
    },
    recentInteractions: (recentInteractions.data ?? []) as (Interaction & {
      contacts: { id: string; name: string } | null
      applications: { id: string; company: string } | null
    })[],
    upcomingReminders: (upcomingReminders.data ?? []) as (Reminder & {
      contacts: { id: string; name: string } | null
      applications: { id: string; company: string } | null
    })[],
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { stats, recentInteractions, upcomingReminders } = await getData(supabase)

  const statCards = [
    { label: 'Total Applications', value: stats.total, color: 'text-indigo-600' },
    { label: 'Interviews', value: stats.interviews, color: 'text-purple-600' },
    { label: 'Offers', value: stats.offers, color: 'text-green-600' },
    { label: 'Contacts', value: stats.contacts, color: 'text-orange-600' },
    { label: 'Open Reminders', value: stats.reminders, color: 'text-rose-600' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your job search pipeline at a glance</p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Pipeline summary */}
      <div>
        <h2 className="text-base font-semibold text-gray-700 mb-3">Pipeline</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {APP_STATUSES.map((status) => (
            <Link
              key={status}
              href={`/applications?status=${status}`}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm min-w-[140px] shrink-0 hover:border-indigo-200 transition-colors"
            >
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_CLASSES[status]}`}
              >
                {STATUS_LABELS[status]}
              </span>
              <p className="text-2xl font-bold text-gray-800 mt-3">{stats.byStatus[status]}</p>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reminders */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Upcoming Reminders</h2>
            <Link href="/reminders?filter=pending" className="text-xs text-indigo-600 hover:underline">
              View all →
            </Link>
          </div>

          {upcomingReminders.length > 0 ? (
            <ul className="space-y-3">
              {upcomingReminders.map((r) => {
                const overdue = isOverdue(r.due_date)
                return (
                  <li key={r.id} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 ${
                        overdue ? 'bg-red-400' : 'bg-indigo-400'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${overdue ? 'text-red-600' : 'text-gray-800'}`}>
                        {r.title}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-0.5">
                        <span className={`text-xs ${overdue ? 'text-red-500' : 'text-gray-400'}`}>
                          {overdue ? 'Overdue · ' : ''}{formatDate(r.due_date)}
                        </span>
                        {r.contacts && (
                          <Link href={`/contacts/${r.contacts.id}`} className="text-xs text-indigo-500 hover:underline">
                            {r.contacts.name}
                          </Link>
                        )}
                        {r.applications && (
                          <Link href={`/applications/${r.applications.id}`} className="text-xs text-indigo-500 hover:underline">
                            {r.applications.company}
                          </Link>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No upcoming reminders.</p>
          )}
        </div>

        {/* Recent Interactions */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-700">Recent Interactions</h2>
          </div>

          {recentInteractions.length > 0 ? (
            <ul className="space-y-3">
              {recentInteractions.map((ix) => (
                <li key={ix.id} className="flex items-start gap-2.5">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0 bg-purple-400" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-full px-2 py-0.5">
                        {INTERACTION_LABELS[ix.type]}
                      </span>
                      <span className="text-xs text-gray-400">{formatDate(ix.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mt-0.5">
                      {ix.contacts && (
                        <Link href={`/contacts/${ix.contacts.id}`} className="text-xs text-indigo-500 hover:underline">
                          {ix.contacts.name}
                        </Link>
                      )}
                      {ix.applications && (
                        <Link href={`/applications/${ix.applications.id}`} className="text-xs text-gray-500 hover:underline">
                          {ix.applications.company}
                        </Link>
                      )}
                    </div>
                    {ix.notes && (
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{ix.notes}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-400">No interactions logged yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
