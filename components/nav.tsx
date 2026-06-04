'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions/auth'
import { LayoutDashboard, FileText, Users, Bell, LogOut } from 'lucide-react'

const links = [
  { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { href: '/applications', label: 'Applications', Icon: FileText },
  { href: '/contacts', label: 'Contacts', Icon: Users },
  { href: '/reminders', label: 'Reminders', Icon: Bell },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-white sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-base font-bold text-indigo-600 shrink-0">
              InternFlow
            </Link>
            <div className="flex gap-0.5">
              {links.map(({ href, label, Icon }) => {
                const active = pathname.startsWith(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>

          <form action={signOut}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
