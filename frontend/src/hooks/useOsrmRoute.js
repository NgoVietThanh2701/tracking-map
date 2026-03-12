import { useCallback, useRef, useState } from 'react'
import { OSRM_CONFIG } from '../constants'

function toRoute(data) {
  const r = data?.routes?.[0]
  const coords = r?.geometry?.coordinates
  if (!r || !Array.isArray(coords) || coords.length < 2) return null

  // OSRM geojson: [lng, lat]
  const latlngs = coords.map(([lng, lat]) => [lat, lng])

  return {
    distance: r.distance, // meters
    duration: r.duration, // seconds
    geometry: r.geometry, // geojson line
    latlngs,
    raw: data,
  }
}

export function useOsrmRoute() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [route, setRoute] = useState(null)
  const abortRef = useRef(null)

  const clear = useCallback(() => {
    abortRef.current?.abort()
    setLoading(false)
    setError(null)
    setRoute(null)
  }, [])

  const getRoute = useCallback(async ({ from, to }) => {
    if (!from || !to) {
      setError('Vui lòng chọn đủ điểm A và B.')
      setRoute(null)
      return null
    }

    setLoading(true)
    setError(null)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    const base = `${OSRM_CONFIG.PROXY_PATH}/${OSRM_CONFIG.PROFILE}`
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`
    const url = new URL(`${base}/${coords}`, window.location.origin)
    url.searchParams.set('overview', OSRM_CONFIG.OVERVIEW)
    url.searchParams.set('geometries', OSRM_CONFIG.GEOMETRIES)

    try {
      const res = await fetch(url.toString(), { signal: controller.signal })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      const parsed = toRoute(data)
      if (!parsed) {
        setError('Không tìm thấy tuyến đường phù hợp.')
        setRoute(null)
        return null
      }
      setRoute(parsed)
      return parsed
    } catch (e) {
      if (e?.name === 'AbortError') return null
      setError('Không thể lấy tuyến đường lúc này. Vui lòng thử lại.')
      setRoute(null)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return { loading, error, route, getRoute, clear }
}

