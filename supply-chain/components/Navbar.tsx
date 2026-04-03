'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'

export default function Navbar() {
  const { data: session } = useSession()
  const user = session?.user as any
  const pathname = usePathname()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const isManagerPanel = pathname?.includes('/manager')
  const isDriverPanel = pathname?.includes('/driver')
  const isAdminPanel = pathname?.includes('/admin')

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinkClass = (isActive: boolean) => 
    `text-sm font-medium transition ${
      isActive 
        ? 'text-emerald-600' 
        : 'text-gray-600 hover:text-gray-900'
    }`

  const getRoleDisplay = () => {
    const roleMap: { [key: string]: string } = {
      manager: 'Manager',
      manager_ship: 'Ship Manager',
      driver: 'Driver',
      admin: 'Admin'
    }
    return roleMap[user?.role] || user?.role
  }

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
            <div className="flex items-center gap-3 relative" ref={dropdownRef}>
              {/* User Dropdown */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <p className="text-xs font-semibold text-gray-900 truncate">
                    {user?.name || user?.email?.split('@')[0]}
                  </p>
                  <p className="text-[10px] text-gray-500">{getRoleDisplay()}</p>
                </div>
                <svg
                  className={`w-4 h-4 text-gray-600 transition ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                  {/* User Profile Section */}
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold">
                        {user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {user?.email}
                        </p>
                      </div>
                      <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded">
                        {getRoleDisplay()}
                      </span>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <ul className="px-2 py-2 text-sm text-gray-700 font-medium">
                    <li>
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          // Add account page link later
                        }}
                        className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Account Settings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          // Add help page link later
                        }}
                        className="flex items-center w-full p-2 rounded-lg hover:bg-gray-100 transition gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Help Center
                      </button>
                    </li>
                  </ul>

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Sign Out */}
                  <ul className="px-2 py-2">
                    <li>
                      <button
                        onClick={() => {
                          setDropdownOpen(false)
                          signOut()
                        }}
                        className="flex items-center w-full p-2 text-red-600 rounded-lg hover:bg-red-50 transition gap-2 font-medium"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}