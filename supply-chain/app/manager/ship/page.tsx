import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ShipRouteMapClient from '@/components/ShipRouteMapClient'
import InfoCards from '@/components/InfoCards'
import ShipSearchForm from '@/components/ShipSearchForm'

export default async function ShipManagerPage() {
  const session = await getServerSession(authOptions)
  const user = session?.user as any

  if (!session || user?.role !== 'manager' || user?.managerType !== 'ship') {
    redirect('/')
  }
  if (!user?.isVerified) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Ship Manager</h1>
        <p className="text-gray-600 mb-8">
          Submit a ship ID to view its original and updated routes, along with affected areas and relevant information.
        </p>

        {/* Ship ID Input Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Search Ship Route</h2>
          
          <ShipSearchForm />
        </div>

        {/* Results will be shown by ShipSearchForm component */}
      </div>
    </div>
  )
}
