'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const { data: session } = useSession()
  const user = session?.user as any
  const pathname = usePathname()

  const isManagerPanel = pathname?.includes('/manager')
  const isDriverPanel = pathname?.includes('/driver')
  const isAdminPanel = pathname?.includes('/admin')

  const navLinkClass = (isActive: boolean) => 
    `text-sm font-medium transition ${
      isActive 
        ? 'text-emerald-600' 
        : 'text-gray-600 hover:text-gray-900'
    }`

  return (
    <nav className="w-full border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Left - Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs group-hover:shadow-md transition">
            SC
          </div>
          <span className="text-lg font-bold text-gray-900 hidden sm:inline tracking-tight">SupplyChain</span>
        </Link>

        {/* Middle - Nav Links */}
        <div className="hidden lg:flex items-center gap-12 flex-1 ml-16">
          {!session ? (
            <Link href="/" className={navLinkClass(pathname === '/')}>
              Home
            </Link>
          ) : (
            <>
              {user?.role === 'manager' && user?.isVerified && (
                <Link href="/manager/road" className={navLinkClass(isManagerPanel)}>
                  My Panel
                </Link>
              )}

              {user?.role === 'manager_ship' && user?.isVerified && (
                <Link href="/manager/ship" className={navLinkClass(isManagerPanel)}>
                  My Panel
                </Link>
              )}

              {user?.role === 'driver' && user?.isVerified && (
                <Link href="/driver" className={navLinkClass(isDriverPanel)}>
                  My Panel
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link href="/admin" className={navLinkClass(isAdminPanel)}>
                  My Panel
                </Link>
              )}
            </>
          )}

          {session && (user?.isVerified || user?.role === 'admin') && (
            <Link href="/routes" className={navLinkClass(pathname?.includes('/routes'))}>
              Routes
            </Link>
          )}

          <Link href="/zones" className={navLinkClass(pathname?.includes('/zones'))}>
            Zones
          </Link>

          <Link href="/weather" className={navLinkClass(pathname?.includes('/weather'))}>
            Weather
          </Link>

          <Link href="/ship-reroutes" className={navLinkClass(pathname?.includes('/ship-reroutes'))}>
            Ship Reroutes
          </Link>
        </div>

        {/* Right - Auth */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {!session ? (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 font-medium hover:text-gray-900 transition hidden sm:inline px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm bg-emerald-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-emerald-700 transition"
              >
                Start Free
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {/* User Info */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100">
                <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                </div>
              </div>

              {/* Sign Out */}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 font-medium hover:text-gray-900 transition px-3 py-2"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}