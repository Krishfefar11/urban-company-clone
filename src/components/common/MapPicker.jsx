import { useEffect, useRef, useState } from 'react'
import { FiMapPin, FiNavigation, FiSearch, FiX, FiLoader } from 'react-icons/fi'

// Leaflet loaded via CDN in index.html — no npm package needed
// Add to index.html: <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
//                    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

const AHMEDABAD = [23.0225, 72.5714]

const MapPicker = ({ value, onChange, className = '' }) => {
  const mapRef     = useRef(null)
  const markerRef  = useRef(null)
  const leafletRef = useRef(null)

  const [address,   setAddress]   = useState(value?.address || '')
  const [searchQ,   setSearchQ]   = useState('')
  const [searching, setSearching] = useState(false)
  const [locating,  setLocating]  = useState(false)
  const [coords,    setCoords]    = useState(value?.coords || AHMEDABAD)
  const [error,     setError]     = useState('')

  // Init map
  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return
    if (leafletRef.current) return // already mounted

    const L = window.L
    const map = L.map(mapRef.current, {
      center: coords,
      zoom:   14,
      zoomControl: false,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
    }).addTo(map)

    // Custom pin icon
    const icon = L.divIcon({
      html: `<div style="
        width:36px;height:36px;background:#111827;border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);border:3px solid #fff;
      "></div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      className: '',
    })

    const marker = L.marker(coords, { icon, draggable: true }).addTo(map)
    markerRef.current = marker
    leafletRef.current = map

    // On marker drag
    marker.on('dragend', async () => {
      const pos = marker.getLatLng()
      setCoords([pos.lat, pos.lng])
      await reverseGeocode(pos.lat, pos.lng)
    })

    // On map click
    map.on('click', async (e) => {
      marker.setLatLng(e.latlng)
      setCoords([e.latlng.lat, e.latlng.lng])
      await reverseGeocode(e.latlng.lat, e.latlng.lng)
    })

    // Zoom controls (custom position)
    L.control.zoom({ position: 'bottomright' }).addTo(map)

    return () => { map.remove(); leafletRef.current = null; markerRef.current = null }
  }, [])

  const reverseGeocode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      setAddress(addr)
      onChange?.({ coords: [lat, lng], address: addr })
    } catch {
      const addr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      setAddress(addr)
      onChange?.({ coords: [lat, lng], address: addr })
    }
  }

  const searchAddress = async () => {
    if (!searchQ.trim()) return
    setSearching(true); setError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQ)}&format=json&limit=1&countrycodes=in`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      if (data[0]) {
        const lat = parseFloat(data[0].lat), lng = parseFloat(data[0].lon)
        const map = leafletRef.current
        const marker = markerRef.current
        if (map && marker) {
          map.setView([lat, lng], 15)
          marker.setLatLng([lat, lng])
        }
        setCoords([lat, lng])
        await reverseGeocode(lat, lng)
        setSearchQ('')
      } else {
        setError('Location not found. Try a different search.')
      }
    } catch {
      setError('Search failed. Please try again.')
    } finally {
      setSearching(false)
    }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError('Geolocation is not supported by your browser.'); return }
    setLocating(true); setError('')
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const map = leafletRef.current
        const marker = markerRef.current
        if (map && marker) {
          map.setView([lat, lng], 16)
          marker.setLatLng([lat, lng])
        }
        setCoords([lat, lng])
        await reverseGeocode(lat, lng)
        setLocating(false)
      },
      () => { setError('Location access denied.'); setLocating(false) }
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <FiSearch size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchAddress()}
            placeholder="Search for your location…"
            className="input pl-9 pr-4"
          />
        </div>
        <button onClick={searchAddress} disabled={searching}
          className="px-4 py-2.5 bg-neutral-900 text-white rounded-xl text-sm font-semibold hover:bg-neutral-800 transition-colors disabled:opacity-50 flex items-center gap-1.5">
          {searching ? <FiLoader size={14} className="animate-spin" /> : 'Search'}
        </button>
      </div>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200" style={{ height: '280px' }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Use my location button */}
        <button onClick={useMyLocation} disabled={locating}
          className="absolute top-3 left-3 flex items-center gap-1.5 bg-white border border-neutral-200 text-neutral-700 font-semibold text-xs px-3 py-2 rounded-xl shadow-card hover:bg-neutral-50 transition-colors disabled:opacity-60 z-[1000]">
          {locating
            ? <FiLoader size={12} className="animate-spin text-brand" />
            : <FiNavigation size={12} className="text-brand" />
          }
          {locating ? 'Locating…' : 'Use my location'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-3 py-2.5 rounded-xl">
          <FiX size={12} /> {error}
        </div>
      )}

      {/* Selected address */}
      {address && (
        <div className="flex items-start gap-2.5 bg-neutral-50 border border-neutral-100 rounded-xl px-4 py-3">
          <FiMapPin size={14} className="text-brand flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs font-semibold text-neutral-700 mb-0.5">Selected location</p>
            <p className="text-xs text-neutral-500 leading-relaxed">{address}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default MapPicker
