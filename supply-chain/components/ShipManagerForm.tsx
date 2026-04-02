'use client'

import { useState, useEffect } from 'react'

interface Ship {
  id: string
  userId: string
  origin: any
  destination: any
  originalRoute: any
  bestRoute: any
  reasons: any
  weatherData: any
  newsData: any
  createdAt: string
  refreshedAt: string
}

interface ShipManagerFormProps {
  onShipSelect: (ship: Ship) => void
}

export default function ShipManagerForm({ onShipSelect }: ShipManagerFormProps) {
  const [ships, setShips] = useState<Ship[]>([])
  const [selectedShipId, setSelectedShipId] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    fetchShips()
  }, [])

  async function fetchShips() {
    try {
      setLoading(true)
      setError('')
      const response = await fetch('/api/manager/ships')

      if (!response.ok) {
        throw new Error('Failed to fetch ships')
      }

      const data = await response.json()
      setShips(data.ships)

      if (data.ships.length > 0) {
        setSelectedShipId(data.ships[0].id)
        onShipSelect(data.ships[0])
      }
    } catch (err) {
      console.error('Error fetching ships:', err)
      setError('Failed to load ships')
    } finally {
      setLoading(false)
    }
  }

  async function handleSearchById() {
    if (!searchInput.trim()) {
      setError('Please enter a Ship ID')
      return
    }

    try {
      setSearching(true)
      setError('')
      const response = await fetch('/api/manager/ships')

      if (!response.ok) {
        throw new Error('Failed to fetch ships')
      }

      const data = await response.json()
      const foundShip = data.ships.find(
        (s: Ship) =>
          s.id.toLowerCase().includes(searchInput.toLowerCase()) ||
          s.id === searchInput
      )

      if (foundShip) {
        setSelectedShipId(foundShip.id)
        onShipSelect(foundShip)
        setSearchInput('')
      } else {
        setError(`Ship with ID "${searchInput}" not found`)
      }
    } catch (err) {
      console.error('Error searching ship:', err)
      setError('Failed to search ship')
    } finally {
      setSearching(false)
    }
  }

  function handleShipChange(shipId: string) {
    setSelectedShipId(shipId)
    const selected = ships.find((s) => s.id === shipId)
    if (selected) {
      onShipSelect(selected)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600">Loading ships...</p>
      </div>
    )
  }

  if (error && ships.length === 0) {
    return (
      <div className="bg-red-50 rounded-lg border border-red-200 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    )
  }

  if (ships.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-600">No ships available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search by Ship ID */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search by Ship ID
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearchById()
              }
            }}
            placeholder="Enter Ship ID or search..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={handleSearchById}
            disabled={searching}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 text-sm font-medium transition"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>

      {/* Dropdown selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or Select from List
        </label>
        <select
          value={selectedShipId}
          onChange={(e) => handleShipChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
        >
          {ships.map((ship) => (
            <option key={ship.id} value={ship.id}>
              {ship.id.substring(0, 8)} - {ship.origin?.name || 'Unknown'} to{' '}
              {ship.destination?.name || 'Unknown'}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
