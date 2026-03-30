import { db } from '@/db/index'
import { ships, roads } from '@/db/schema'
import RoutesClient from '@/components/RoutesClient'

export default async function RoutesPage() {
  const allShips = await db.select().from(ships)
  const allRoads = await db.select().from(roads)

  return (
    <RoutesClient
      ships={allShips}
      roads={allRoads}
    />
  )
}