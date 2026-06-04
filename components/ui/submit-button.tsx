'use client'

import { useFormStatus } from 'react-dom'

export function SubmitButton({ label, loadingLabel }: { label: string; loadingLabel: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-indigo-600 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {pending ? loadingLabel : label}
    </button>
  )
}
