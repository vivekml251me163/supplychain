'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
  const { data: session } = useSession()
  const user = session?.user as any

  return (
    <nav className="w-full border-b border-gray-200 bg-white px-8 py-3 flex items-center justify-between">

      {/* Left - Logo */}
      <Link href="/" className="text-lg font-semibold text-gray-800">
        SupplyChain AI
      </Link>

      {/* Middle - Nav Links */}
      <div className="flex items-center gap-6">
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
          Dashboard
        </Link>

        {/* Only show if logged in and verified */}
        {session && (user?.isVerified || user?.role === 'admin') && (
          <>
            <Link href="/roads" className="text-sm text-gray-600 hover:text-gray-900">
              Roads 🚛
            </Link>
            <Link href="/ships" className="text-sm text-gray-600 hover:text-gray-900">
              Ships 🚢
            </Link>
          </>
        )}

        {/* Admin only */}
        {user?.role === 'admin' && (
          <Link href="/admin" className="text-sm text-purple-600 hover:text-purple-800 font-medium">
            Admin Panel
          </Link>
        )}

        {/* Manager only */}
        {user?.role === 'manager' && user?.isVerified && (
          <>
            <Link href="/manager/road" className="text-sm text-green-600 hover:text-green-800 font-medium">
              Manage Routes
            </Link>
          </>
        )}

        {/* Driver only */}
        {user?.role === 'driver' && user?.isVerified && (
          <Link href="/driver" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            My Routes
          </Link>
        )}
      </div>
      {/* Affected Zones Link */}
      <Link href="/zones" className="text-sm text-gray-600 hover:text-gray-900">
  Affected Zones 🌐
</Link>

      {/* Right - Auth */}
      <div className="flex items-center gap-3">
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
              className="text-sm bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800"
            >
              Register
            </Link>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {/* User info */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-700">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-gray-800">{user?.name}</span>
                <span className="text-xs text-gray-400">{user?.role}</span>
              </div>
            </div>

            {/* Verified badge */}
            {user?.isVerified ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                ✓ Verified
              </span>
            ) : (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                Pending
              </span>
            )}

            {/* Sign out */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="text-sm text-red-500 hover:text-red-700 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}