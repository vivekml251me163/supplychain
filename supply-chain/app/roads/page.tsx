'use client'

import RouteMapClient from '@/components/RouteMapClient'

export default function Page() {
  const originalRoute = [
  { lat: 12.9716, lng: 77.5946 },  // Bangalore
  { lat: 13.9299, lng: 77.2753 },  // Tumkur
  { lat: 14.4673, lng: 76.0138 },  // Chitradurga
  { lat: 15.1394, lng: 75.9236 },  // Davangere
  { lat: 15.3647, lng: 75.1240 },  // Hubli
  { lat: 15.8497, lng: 74.4977 },  // Dharwad
  { lat: 16.8302, lng: 74.1240 },  // Kolhapur
  { lat: 17.6805, lng: 74.0183 },  // Satara
  { lat: 18.5204, lng: 73.8567 },  // Pune
  { lat: 18.9068, lng: 73.0800 },  // Khopoli
  { lat: 19.0760, lng: 72.8777 },  // Mumbai
]

  const bestRoute = [
  { lat: 12.9716, lng: 77.5946 },  // Bangalore
  { lat: 13.9299, lng: 77.2753 },  // Tumkur
  { lat: 14.4673, lng: 76.0138 },  // Chitradurga
  { lat: 15.1394, lng: 75.9236 },  // Davangere
  { lat: 15.3647, lng: 75.1240 },  // Hubli
  { lat: 16.1833, lng: 74.8333 },  // Belgaum (alternate)
  { lat: 17.3850, lng: 74.5944 },  // Sangli (alternate)
  { lat: 18.5204, lng: 73.8567 },  // Pune
  { lat: 18.9068, lng: 73.0800 },  // Khopoli
  { lat: 19.0760, lng: 72.8777 },  // Mumbai
]

  const reasons = [
  "Heavy flooding reported near Kolhapur",
  "Highway blocked due to landslide at Satara",
  "Rerouted via Belgaum - Sangli for safer passage"
]

  return (
    <div className="p-8">
      <RouteMapClient
        originalRoute={originalRoute}
        bestRoute={bestRoute}
        reasons={reasons}
      />
    </div>
  )
}