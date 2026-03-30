import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ManagerPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'manager') {
    redirect('/')
  }

  // Redirect to appropriate manager page based on manager type
  if (user?.managerType === 'ship') {
    redirect('/manager/ship')
  } else if (user?.managerType === 'road') {
    redirect('/manager/road')
  }

  // If no manager type is set, show an error message
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Manager Type Not Set</h1>
        <p className="text-gray-600 mb-6">
          Your manager type (Ship or Road) has not been configured yet.
        </p>
        <p className="text-sm text-gray-500">
          Please contact an administrator to set your manager type.
        </p>
      </div>
    </div>
  )
}