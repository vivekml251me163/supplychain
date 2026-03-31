'use client'

import ShipRouteMapClient from '@/components/ShipRouteMapClient'

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
    {
      lat: 12.971848,
      lng: 77.594697
    },
    {
      lat: 12.968096848688004,
      lng: 77.59162172655536
    },
    {
      lat: 12.96469336828804,
      lng: 77.57510717150785
    },
    {
      lat: 12.962803695813719,
      lng: 77.56614898888984
    },
    {
      lat: 12.960497802247072,
      lng: 77.5572934029961
    },
    {
      lat: 12.95672770825579,
      lng: 77.54923700899087
    },
    {
      lat: 12.952554563295818,
      lng: 77.54127244141351
    },
    {
      lat: 12.947569966340843,
      lng: 77.53366063282357
    },
    {
      lat: 12.942890162419141,
      lng: 77.52603068744224
    },
    {
      lat: 12.93662645500581,
      lng: 77.51960443413286
    },
    {
      lat: 12.934498344569095,
      lng: 77.5107398792014
    },
    {
      lat: 12.86926238946046,
      lng: 77.43812165852766
    },
  ]

  const reasons = [
    "Cyclone warning reported near Tuticorin shipping lane",
    "High wave alerts in Bay of Bengal on original path",
    "Rerouted via Colombo Port for safer passage",
  ]

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <ShipRouteMapClient
        originalRoute={originalRoute}
        bestRoute={bestRoute}
        reasons={reasons}
      />
    </div>
  )
}