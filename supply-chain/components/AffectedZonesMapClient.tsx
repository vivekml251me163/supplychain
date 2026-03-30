'use client'

import AffectedZonesMap from '@/components/AffectedZonesMap'

interface Zone {
  id: number
  newsId: number | null
  weatherId: number | null
  aiSummary: string
  consequence: string
  centerLat: number
  centerLong: number
  radiusKm: number
  severity: number
  confidence: number
}

interface AffectedZonesMapClientProps {
  zones: Zone[]
}

export default function AffectedZonesMapClient({ zones }: AffectedZonesMapClientProps) {
  return <AffectedZonesMap zones={zones} />
}
