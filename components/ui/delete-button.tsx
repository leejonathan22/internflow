'use client'

export function DeleteButton({
  formAction,
  confirmMessage,
}: {
  formAction: (formData: FormData) => Promise<void>
  confirmMessage: string
}) {
  return (
    <form action={formAction}>
      <button
        type="submit"
        className="bg-red-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
        onClick={(e) => {
          if (!confirm(confirmMessage)) e.preventDefault()
        }}
      >
        Delete
      </button>
    </form>
  )
}
