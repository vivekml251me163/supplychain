import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) {
      return NextResponse.json({ error: 'lat and lon are required' }, { status: 400 })
    }

    // Use OpenStreetMap's Nominatim for reverse geocoding
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      {
        headers: {
          'User-Agent': 'supply-chain-app',
        },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch location name' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const address = data.address || {}

    return NextResponse.json({
      placeName:
        data.name ||
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state ||
        `${lat}, ${lon}`,
      address: data.display_name || '',
      lat,
      lon,
    })
  } catch (error) {
    console.error('[Geocoding Error]', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch location name',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
