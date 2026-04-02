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

  return (
    <nav className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
        {/* Left - Logo */}
        <Link href="/" className="text-lg font-bold text-gray-900">
          SupplyChain AI
        </Link>

        {/* Middle - Nav Links */}
        <div className="flex items-center gap-8 flex-1 ml-12">
          <Link
            href="/"
            className={`text-sm font-medium transition ${
              pathname === '/'
                ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Dashboard
          </Link>

          {/* Only show if logged in and verified */}
          {session && (user?.isVerified || user?.role === 'admin') && (
            <>
              <Link
                href="/routes"
                className={`text-sm font-medium transition ${
                  pathname?.includes('/routes')
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Routes
              </Link>
              <Link
                href="/zones"
                className={`text-sm font-medium transition ${
                  pathname?.includes('/zones')
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Affected Zones
              </Link>
              <Link
                href="/weather"
                className={`text-sm font-medium transition ${
                  pathname?.includes('/weather')
                    ? 'text-gray-900 border-b-2 border-gray-900 pb-1'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Weather Alerts
              </Link>
            </>
          )}

          {/* Manager Panel */}
          {user?.role === 'manager' && user?.isVerified && (
            <Link
              href="/manager/road"
              className={`text-sm font-medium transition ${
                isManagerPanel
                  ? 'text-green-600 border-b-2 border-green-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Manager Panel
            </Link>
          )}

          {/* Manager Ship Panel */}
          {user?.role === 'manager_ship' && user?.isVerified && (
            <Link
              href="/manager/ship"
              className={`text-sm font-medium transition ${
                isManagerPanel
                  ? 'text-purple-600 border-b-2 border-purple-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Ship Manager
            </Link>
          )}

          {/* Driver Panel */}
          {user?.role === 'driver' && user?.isVerified && (
            <Link
              href="/driver"
              className={`text-sm font-medium transition ${
                isDriverPanel
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Driver Panel
            </Link>
          )}

          {/* Admin Panel */}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className={`text-sm font-medium transition ${
                isAdminPanel
                  ? 'text-green-600 border-b-2 border-green-600 pb-1'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Admin Panel
            </Link>
          )}
        </div>

        {/* Right - Auth */}
        <div className="flex items-center gap-4">
          {!session ? (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                
                {/* Username */}
                <span className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </span>
              </div>

              {/* Sign Out */}
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition"
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