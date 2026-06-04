import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { updateApplication } from '@/lib/actions/applications'
import { APP_STATUSES, STATUS_LABELS } from '@/lib/utils'
import type { Application } from '@/lib/types'

export default async function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data } = await supabase.from('applications').select('*').eq('id', id).single()
  if (!data) notFound()
  const app = data as Application

  const action = updateApplication.bind(null, id)

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href={`/applications/${id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {app.company}
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Application</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <form action={action} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input
                id="company"
                name="company"
                type="text"
                required
                defaultValue={app.company}
                className="input-base"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <input
                id="role"
                name="role"
                type="text"
                required
                defaultValue={app.role}
                className="input-base"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select id="status" name="status" defaultValue={app.status} className="input-base">
                {APP_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="applied_date" className="block text-sm font-medium text-gray-700 mb-1">
                Applied Date
              </label>
              <input
                id="applied_date"
                name="applied_date"
                type="date"
                defaultValue={app.applied_date ?? ''}
                className="input-base"
              />
            </div>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Job Posting URL
            </label>
            <input
              id="url"
              name="url"
              type="url"
              defaultValue={app.url ?? ''}
              placeholder="https://..."
              className="input-base"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={app.notes ?? ''}
              className="input-base"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Save Changes
            </button>
            <Link
              href={`/applications/${id}`}
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
