import Link from 'next/link'
import { signUp } from '@/lib/actions/auth'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; success?: string }>
}) {
  const { error, success } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">InternFlow</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your account</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {decodeURIComponent(error)}
            </div>
          )}

          {success ? (
            <div className="space-y-4 text-center">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                Account created! Check your email to confirm before signing in.
              </div>
              <Link
                href="/login"
                className="block w-full bg-indigo-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors text-center"
              >
                Go to sign in
              </Link>
            </div>
          ) : (
            <form action={signUp} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="input-base"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="input-base"
                />
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="input-base"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white rounded-md px-4 py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors"
              >
                Create account
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
