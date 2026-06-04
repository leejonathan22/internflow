import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { APP_STATUSES, STATUS_LABELS, STATUS_CLASSES, formatDate } from '@/lib/utils'
import type { Application, AppStatus } from '@/lib/types'

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; company?: string }>
}) {
  const { status, company } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && APP_STATUSES.includes(status as AppStatus)) {
    query = query.eq('status', status)
  }
  if (company) {
    query = query.ilike('company', `%${company}%`)
  }

  const { data: applications } = await query
  const apps = (applications ?? []) as Application[]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-sm text-gray-500 mt-0.5">{apps.length} total</p>
        </div>
        <Link
          href="/applications/new"
          className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          + New Application
        </Link>
      </div>

      {/* Filters */}
      <form method="GET" className="flex flex-wrap gap-2 items-center">
        <select
          name="status"
          defaultValue={status ?? ''}
          className="input-base w-auto"
        >
          <option value="">All Statuses</option>
          {APP_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <input
          name="company"
          defaultValue={company ?? ''}
          placeholder="Company..."
          className="input-base w-44"
        />

        <button
          type="submit"
          className="border border-gray-300 bg-white text-gray-700 text-sm px-3 py-2 rounded-md hover:bg-gray-50"
        >
          Filter
        </button>

        {(status || company) && (
          <Link
            href="/applications"
            className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-left">
              <th className="px-5 py-3 font-medium text-gray-500">Company</th>
              <th className="px-5 py-3 font-medium text-gray-500">Role</th>
              <th className="px-5 py-3 font-medium text-gray-500">Status</th>
              <th className="px-5 py-3 font-medium text-gray-500">Applied</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {apps.length > 0 ? (
              apps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{app.company}</td>
                  <td className="px-5 py-3.5 text-gray-600">{app.role}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_CLASSES[app.status]}`}
                    >
                      {STATUS_LABELS[app.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(app.applied_date)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/applications/${app.id}`}
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
                  No applications found.{' '}
                  <Link href="/applications/new" className="text-indigo-600 hover:underline">
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
