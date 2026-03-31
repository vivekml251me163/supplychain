'use client'

import { useEffect } from 'react'

export function useGeolocation() {
  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          try {
            await fetch('/api/driver/location', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ lat: latitude, lon: longitude }),
            })
          } catch (error) {
            console.error('Failed to update location:', error)
          }
        },
        (error) => {
          console.error('Geolocation error:', error)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )

      // Set up interval to update location every 5 minutes
      const interval = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords
            try {
              await fetch('/api/driver/location', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat: latitude, lon: longitude }),
              })
            } catch (error) {
              console.error('Failed to update location:', error)
            }
          },
          (error) => {
            console.error('Geolocation error:', error)
          }
        )
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [])
}
