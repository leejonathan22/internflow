import Link from 'next/link'
import { createApplication } from '@/lib/actions/applications'
import { APP_STATUSES, STATUS_LABELS } from '@/lib/utils'

export default function NewApplicationPage() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link href="/applications" className="text-sm text-gray-500 hover:text-gray-700">
          ← Applications
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Application</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <form action={createApplication} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                Company <span className="text-red-500">*</span>
              </label>
              <input id="company" name="company" type="text" required placeholder="e.g. Google" className="input-base" />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <input id="role" name="role" type="text" required placeholder="e.g. Software Engineer Intern" className="input-base" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select id="status" name="status" defaultValue="wishlist" className="input-base">
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
              <input id="applied_date" name="applied_date" type="date" className="input-base" />
            </div>
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              Job Posting URL
            </label>
            <input id="url" name="url" type="url" placeholder="https://..." className="input-base" />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="Anything to remember about this role..."
              className="input-base"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Create Application
            </button>
            <Link
              href="/applications"
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
