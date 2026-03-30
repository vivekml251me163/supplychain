'use client'

import ShipRouteMap from '@/components/ShipRouteMap'

export default function ShipsPage() {

  
  // Mumbai to Singapore - Original Route (via Palk Strait)
  const originalRoute = [
    { lat: 18.9322, lng: 72.8375 },  // Mumbai Port
    { lat: 16.5000, lng: 72.0000 },  // Arabian Sea south
    { lat: 13.0000, lng: 72.5000 },  // Lakshadweep Sea
    { lat: 10.5000, lng: 72.8000 },  // West of Maldives
    { lat: 8.0000,  lng: 76.5000 },  // South Kerala coast (sea)
    { lat: 7.0000,  lng: 79.0000 },  // Gulf of Mannar
    { lat: 5.9000,  lng: 80.5000 },  // South of Sri Lanka
    { lat: 5.0000,  lng: 84.0000 },  // Indian Ocean
    { lat: 4.0000,  lng: 90.0000 },  // Indian Ocean mid
    { lat: 3.5000,  lng: 96.0000 },  // Andaman Sea west
    { lat: 2.5000,  lng: 100.0000 }, // Malacca Strait entry
    { lat: 1.5000,  lng: 102.5000 }, // Malacca Strait
    { lat: 1.2966,  lng: 103.8006 }, // Singapore Port
  ]

  // Mumbai to Singapore - Best Route (via west of Maldives - avoiding storm)
  const bestRoute = [
    { lat: 18.9322, lng: 72.8375 },  // Mumbai Port
    { lat: 16.5000, lng: 72.0000 },  // Arabian Sea south
    { lat: 13.0000, lng: 71.0000 },  // Far west of Lakshadweep
    { lat: 8.0000,  lng: 70.0000 },  // West of Maldives (deep ocean)
    { lat: 4.0000,  lng: 71.0000 },  // South of Maldives
    { lat: 1.0000,  lng: 76.0000 },  // Deep Indian Ocean
    { lat: 0.5000,  lng: 83.0000 },  // Indian Ocean
    { lat: 1.0000,  lng: 95.0000 },  // Andaman Sea
    { lat: 1.5000,  lng: 102.5000 }, // Malacca Strait
    { lat: 1.2966,  lng: 103.8006 }, // Singapore Port
  ]

  const reasons = [
    "Cyclone warning reported near Tuticorin shipping lane",
    "High wave alerts in Bay of Bengal on original path",
    "Rerouted via Colombo Port for safer passage",
  ]

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <ShipRouteMap
        originalRoute={originalRoute}
        bestRoute={bestRoute}
        reasons={reasons}
      />
    </div>
  )
}