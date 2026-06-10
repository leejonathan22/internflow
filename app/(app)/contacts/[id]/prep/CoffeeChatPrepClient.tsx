'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import type { Contact, PrepSession, CoffeeChatOutput } from '@/lib/types'

interface Props {
  contact: Contact
  initialSessions: PrepSession[]
}

export default function CoffeeChatPrepClient({ contact, initialSessions }: Props) {
  const [goal, setGoal] = useState('')
  const [background, setBackground] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<CoffeeChatOutput | null>(null)
  const [sessions, setSessions] = useState<PrepSession[]>(initialSessions)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/prep/coffee-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: contact.id,
          name: contact.name,
          title: contact.role ?? '',
          company: contact.company ?? '',
          goal,
          background,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate prep')
      setResult(data.output)
      if (data.session) setSessions((prev) => [data.session, ...prev])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <Link href={`/contacts/${contact.id}`} className="text-sm text-gray-500 hover:text-gray-700">
          ← {contact.name}
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <h1 className="text-2xl font-bold text-gray-900">Coffee Chat Prep</h1>
          <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
            AI
          </span>
        </div>
        <p className="text-gray-500 mt-0.5">
          {contact.name}
          {contact.role ? `, ${contact.role}` : ''}
          {contact.company ? ` at ${contact.company}` : ''}
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your goal for this chat
          </label>
          <input
            type="text"
            required
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g. learn about the PM role, ask for a referral"
            className="input-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Your background</label>
          <textarea
            rows={3}
            value={background}
            onChange={(e) => setBackground(e.target.value)}
            placeholder="e.g. 3rd year CS student, interned at X, interested in product management"
            className="input-base resize-none"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Generating...
            </>
          ) : (
            'Generate Prep'
          )}
        </button>
      </form>

      {/* Results */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-xs bg-indigo-100 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">
              AI
            </span>
            Generated Prep
          </h2>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Suggested Questions
            </h3>
            <ul className="space-y-2">
              {result.questions.map((q, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-indigo-400 font-semibold shrink-0 w-4">{i + 1}.</span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Talking Points
            </h3>
            <ul className="space-y-2">
              {result.talking_points.map((tp, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-green-500 shrink-0">•</span>
                  {tp}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Things to Research
            </h3>
            <ul className="space-y-2">
              {result.research.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-orange-400 shrink-0">→</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Follow-up Email
            </h3>
            <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 rounded-lg p-4 border border-gray-100 font-sans leading-relaxed">
              {result.follow_up_email}
            </pre>
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {sessions.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Past Prep Sessions</h2>
          <div className="divide-y divide-gray-100">
            {sessions.map((s) => {
              const output = s.output_json as CoffeeChatOutput
              const input = s.input_json as { goal: string }
              return (
                <details key={s.id} className="py-3 first:pt-0 last:pb-0">
                  <summary className="cursor-pointer list-none flex items-center justify-between hover:text-indigo-600">
                    <span className="text-sm text-gray-700 font-medium">{input.goal}</span>
                    <span className="text-xs text-gray-400 ml-4 shrink-0">
                      {formatDate(s.created_at)}
                    </span>
                  </summary>
                  <div className="mt-3 space-y-3 pl-1">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        Questions
                      </p>
                      <ul className="space-y-1">
                        {output.questions.map((q, i) => (
                          <li key={i} className="text-xs text-gray-600">
                            {i + 1}. {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                        Follow-up Email
                      </p>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap bg-gray-50 rounded p-3 border border-gray-100 font-sans">
                        {output.follow_up_email}
                      </pre>
                    </div>
                  </div>
                </details>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
