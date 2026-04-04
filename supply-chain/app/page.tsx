import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";
import Button from "@/components/Button";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <main className="w-full bg-white">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-10"></div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Center-aligned Hero Content */}
          <div className="text-center space-y-8">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 rounded-full px-3 py-1.5 text-xs font-semibold tracking-tight poppins-semibold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                The Modern Logistics Platform
              </span>
            </div>
            
            <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight tracking-tight poppins-bold">
              Manage your supply with
              <span className="block bg-linear-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">precision and clarity</span>
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto poppins-regular">
              Real-time tracking, intelligent routing, weather integration, and role-based access—all in one unified platform built for modern logistics operations.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              {!session ? (
                <>
                  <Link href="/register">
                    <Button variant="default" className="inline-flex items-center justify-center gap-2">
                      Start Free Trial
                      <span>→</span>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="tertiary" className="inline-flex items-center justify-center gap-2">
                      Sign In
                    </Button>
                  </Link>
                </>
              ) : (
                <SignOutButton />
              )}
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center gap-2 pt-16">
              <p className="text-xs text-slate-500 poppins-regular">
                Joined by <span className="font-semibold text-slate-600 poppins-semibold">500+ companies worldwide</span>
              </p>
            </div>
          </div>

          {/* Glassmorphism Dashboard Mockup */}
          <div className="mt-20 relative group">
            <div className="absolute inset-0 bg-linear-to-r from-emerald-200 to-emerald-100 rounded-2xl blur-2xl opacity-20 group-hover:opacity-30 transition duration-500"></div>
            <div className="relative bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl p-8 shadow-2xl overflow-hidden">
              {/* Dark dashboard mockup inside glassmorphism */}
              <div className="bg-linear-to-br from-gray-900 to-gray-800 rounded-xl p-6 space-y-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-2 bg-gray-700 rounded-full w-1/3"></div>
                  <div className="h-2 bg-gray-700 rounded-full w-1/4"></div>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="h-16 bg-linear-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-lg"></div>
                  <div className="h-16 bg-linear-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-lg"></div>
                  <div className="h-16 bg-linear-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {!session ? (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 tracking-tight poppins-bold">
                Everything you need
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed poppins-regular">
                Powerful features designed to optimize your logistics operations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: '🗺️', title: 'Smart Route Planning', desc: 'AI-powered algorithms optimize delivery routes for maximum efficiency' },
                { icon: '📍', title: 'Real-time Tracking', desc: 'Live GPS monitoring with intuitive maps and comprehensive analytics' },
                { icon: '🌤️', title: 'Weather Integration', desc: 'Real-time weather alerts and route recommendations' },
                { icon: '👥', title: 'Role-Based Access', desc: 'Granular permissions for Admin, Manager, and Driver roles' },
                { icon: '✅', title: 'Work Completion', desc: 'Verify deliveries with driver confirmations and status tracking' },
                { icon: '🔒', title: 'Enterprise Security', desc: 'NextAuth, verified accounts, encryption, and role-based management' }
              ].map((feature, idx) => (
                <div key={idx} className="group relative bg-white rounded-lg p-8 border border-slate-100 hover:border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 poppins-semibold">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed poppins-regular">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4 tracking-tight poppins-bold">
                Welcome back
              </h2>
              <p className="text-xl text-gray-600 poppins-regular">
                Access your dashboard and manage operations
              </p>
              
              <div className="mt-8 inline-flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2.5">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full"></span>
                <span className="font-semibold text-gray-900 capitalize text-sm poppins-semibold">{user?.role}</span>
                {user?.isVerified ? (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full font-semibold poppins-semibold">✓ Verified</span>
                ) : (
                  <span className="text-xs bg-gray-200 text-gray-700 px-2.5 py-0.5 rounded-full font-semibold poppins-semibold">⏳ Pending</span>
                )}
              </div>
            </div>

            {!user?.isVerified && user?.role !== 'admin' && (
              <div className="max-w-3xl mx-auto mb-12 bg-gray-100 border border-gray-300 rounded-lg p-4">
                <p className="text-gray-900 flex items-start gap-3 text-sm poppins-regular">
                  <span className="text-lg">ℹ️</span>
                  <span><strong className="poppins-semibold">Verification Pending:</strong> Your account is awaiting admin verification. Some features may be restricted.</span>
                </p>
              </div>
            )}

            {/* Quick Access Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(user?.role === 'admin' || user?.isVerified) && (
                <>
                  <Link href="/roads" className="group relative bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition duration-300">
                    <div className="text-3xl mb-4">🛣️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 poppins-semibold">Road Routes</h3>
                    <p className="text-gray-600 text-sm poppins-regular">Manage road-based logistics efficiently</p>
                  </Link>

                  <Link href="/ships" className="group relative bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition duration-300">
                    <div className="text-3xl mb-4">⛴️</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 poppins-semibold">Ship Routes</h3>
                    <p className="text-gray-600 text-sm poppins-regular">Track maritime operations with real-time data</p>
                  </Link>

                  <Link href="/routes" className="group relative bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition duration-300">
                    <div className="text-3xl mb-4">📍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 poppins-semibold">All Routes</h3>
                    <p className="text-gray-600 text-sm poppins-regular">View complete logistics network overview</p>
                  </Link>
                </>
              )}

              {user?.role === 'admin' && (
                <Link href="/admin" className="group relative bg-white rounded-lg p-6 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 transition duration-300">
                  <div className="text-3xl mb-4">⚙️</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 poppins-semibold">Admin Panel</h3>
                  <p className="text-gray-600 text-sm poppins-regular">Manage users, roles, and system settings</p>
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Explore Tools Section (visible to all) ── */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 rounded-full px-3 py-1.5 text-xs font-semibold tracking-tight poppins-semibold mb-4">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Tools
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 tracking-tight poppins-bold">
              Explore our intelligence tools
            </h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto poppins-regular">
              Real-time data, smart alerts, and dynamic rerouting — all at your fingertips.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Weather Tile */}
            <Link
              href="/weather"
              className="group relative rounded-2xl overflow-hidden border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-cyan-50 hover:shadow-2xl hover:shadow-sky-200/50 hover:-translate-y-2 transition-all duration-300 p-8 flex flex-col"
            >
              {/* Glow blob */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-sky-300/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

              {/* Icon */}
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-cyan-500 flex items-center justify-center mb-6 shadow-lg shadow-sky-300/40 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 poppins-bold">Weather Intelligence</h3>
                <p className="text-gray-500 text-sm leading-relaxed poppins-regular mb-5">
                  Monitor live weather conditions across all active routes. Get automated storm alerts, wind forecasts, and visibility reports to keep shipments safe.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Live Radar', 'Storm Alerts', 'Wind Data', 'Forecasts'].map(tag => (
                    <span key={tag} className="text-xs font-medium bg-sky-100 text-sky-700 px-2.5 py-1 rounded-full poppins-medium">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sky-600 font-semibold text-sm poppins-semibold group-hover:gap-3 transition-all duration-200">
                Open Weather
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            {/* Zones Tile */}
            <Link
              href="/zones"
              className="group relative rounded-2xl overflow-hidden border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-purple-50 hover:shadow-2xl hover:shadow-violet-200/50 hover:-translate-y-2 transition-all duration-300 p-8 flex flex-col"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-300/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-violet-300/40 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 poppins-bold">Shipping Zones</h3>
                <p className="text-gray-500 text-sm leading-relaxed poppins-regular mb-5">
                  Visualize geographic shipping zones, coverage areas, and regional boundaries. Optimize zone assignments and identify coverage gaps across your network.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Zone Mapping', 'Coverage', 'Boundaries', 'Analytics'].map(tag => (
                    <span key={tag} className="text-xs font-medium bg-violet-100 text-violet-700 px-2.5 py-1 rounded-full poppins-medium">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-violet-600 font-semibold text-sm poppins-semibold group-hover:gap-3 transition-all duration-200">
                Explore Zones
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

            {/* Ship Reroutes Tile */}
            <Link
              href="/ship-reroutes"
              className="group relative rounded-2xl overflow-hidden border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-orange-50 hover:shadow-2xl hover:shadow-amber-200/50 hover:-translate-y-2 transition-all duration-300 p-8 flex flex-col"
            >
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-300/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-6 shadow-lg shadow-amber-300/40 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2 poppins-bold">Ship Reroutes</h3>
                <p className="text-gray-500 text-sm leading-relaxed poppins-regular mb-5">
                  Dynamically reroute maritime vessels in response to weather disruptions, port congestion, or priority changes — with instant crew notifications.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Auto-Reroute', 'Port Alerts', 'AI Paths', 'Crew Notify'].map(tag => (
                    <span key={tag} className="text-xs font-medium bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full poppins-medium">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 text-amber-600 font-semibold text-sm poppins-semibold group-hover:gap-3 transition-all duration-200">
                View Reroutes
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* Stats Section - Refined with Subtle Border */}
      {!session && (
        <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 border-t border-slate-800">
          <div className="max-w-7xl mx-auto relative">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16">
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-bold text-white tracking-tight poppins-bold">1000+</div>
                <p className="text-slate-400 text-sm font-light mt-2 tracking-wide poppins-regular">Active Routes</p>
              </div>
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-bold text-white tracking-tight">500+</div>
                <p className="text-slate-400 text-sm font-light mt-2 tracking-wide">Drivers Connected</p>
              </div>
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-bold text-white tracking-tight">50+</div>
                <p className="text-slate-400 text-sm font-light mt-2 tracking-wide">Companies</p>
              </div>
              <div className="text-center">
                <div className="text-5xl lg:text-6xl font-bold text-white tracking-tight">99.9%</div>
                <p className="text-slate-400 text-sm font-light mt-2 tracking-wide">Uptime SLA</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      {!session && (
        <section className="py-32 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Ready to transform your operations?
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed mb-10">
              Join hundreds of companies optimizing logistics, reducing costs, and improving efficiency. Start your free 30-day trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold px-8 py-3.5 rounded-lg hover:bg-emerald-700 hover:-translate-y-0.5 transition"
              >
                Start Free Trial
                <span>→</span>
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-900 font-semibold px-8 py-3.5 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition"
              >
                Contact Sales
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-8">
              No credit card required • Set up in 5 minutes • 30-day free trial
            </p>
          </div>
        </section>
      )}
    </main>
  );
}