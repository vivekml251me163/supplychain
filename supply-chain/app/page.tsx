import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SignOutButton from "@/components/SignOutButton";

export default async function Page() {
  const session = await getServerSession(authOptions);
  const user = session?.user as any;

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl p-8">
      <h1 className="text-3xl font-semibold">Supply Chain Dashboard</h1>
      <p className="mt-2 text-gray-600">Track road and ship routes with account-based access.</p>

      {!session ? (
        <div className="mt-8 rounded-xl border p-6">
          <p className="text-sm text-gray-700">You are currently signed out.</p>
          <div className="mt-4 flex gap-3">
            <Link href="/login" className="rounded-md bg-black px-4 py-2 text-white">
              Sign in
            </Link>
            <Link href="/register" className="rounded-md border px-4 py-2">
              Create account
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 space-y-4 rounded-xl border p-6">
          <p className="text-sm text-gray-700">
            Signed in as <span className="font-medium">{user?.name || user?.email}</span>
            {' '}
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              {user?.role}
            </span>
            {' '}
            {user?.isVerified ? (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                ✓ Verified
              </span>
            ) : (
              <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
                Pending verification
              </span>
            )}
          </p>

          {/* show restricted message if not verified */}
          {!user?.isVerified && user?.role !== 'admin' && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm text-yellow-700">
              ⚠️ Your account is pending verification by admin. Some features may be restricted.
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {/* roads — manager + driver only if verified */}
            {(user?.role === 'admin' || user?.isVerified) && (
              <Link href="/roads" className="rounded-md border px-4 py-2 hover:bg-gray-100">
                Open road routes
              </Link>
            )}

            {/* ships — manager + driver only if verified */}
            {(user?.role === 'admin' || user?.isVerified) && (
              <Link href="/ships" className="rounded-md border px-4 py-2 hover:bg-gray-100">
                Open ship routes
              </Link>
            )}

            {/* admin panel */}
            {user?.role === 'admin' && (
              <Link href="/admin" className="rounded-md bg-purple-600 text-white px-4 py-2 hover:bg-purple-700">
                Admin panel
              </Link>
            )}

            <SignOutButton />
          </div>
        </div>
      )}
    </main>
  );
}