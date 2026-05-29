'use client'

import { updateProfilPelanggan } from '@/app/dashboard/actions'
import { MapPin, Loader2 } from 'lucide-react'
import { FormEvent, useEffect, useRef, useState } from 'react'

// ── Bounding box Kabupaten Padang Pariaman ──────────────────────────────────
const BOUNDS = {
  south: -0.88,
  north: -0.28,
  west: 99.88,
  east: 100.38,
}
const CENTER: [number, number] = [-0.545, 100.1167]

function inBounds(lat: number, lng: number) {
  return (
    lat >= BOUNDS.south &&
    lat <= BOUNDS.north &&
    lng >= BOUNDS.west &&
    lng <= BOUNDS.east
  )
}

function injectLeafletCss() {
  if (document.getElementById('leaflet-css')) return
  const link = document.createElement('link')
  link.id = 'leaflet-css'
  link.rel = 'stylesheet'
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
  document.head.appendChild(link)
}

type Coords = { lat: number; lng: number }

type ProfilFormProps = {
  noHp: string
  alamat: string
  latitude: number | null
  longitude: number | null
}

export default function ProfilForm({
  noHp,
  alamat,
  latitude,
  longitude,
}: ProfilFormProps) {
  const [showMap, setShowMap] = useState(false)
  const [coords, setCoords] = useState<Coords | null>(
    latitude && longitude ? { lat: latitude, lng: longitude } : null,
  )
  const [alamatValue, setAlamatValue] = useState(alamat)
  const [outOfBounds, setOutOfBounds] = useState(false)
  const [mapError, setMapError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstRef = useRef<import('leaflet').Map | null>(null)
  const markerRef = useRef<import('leaflet').Marker | null>(null)

  async function reverseGeocode(lat: number, lng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'id', 'User-Agent': 'DistricNet/1.0' } },
      )
      const data = (await res.json()) as { display_name?: string }
      setAlamatValue(data.display_name ?? alamatValue)
    } catch {
      // keep existing alamat value
    }
  }

  function handleCoords(lat: number, lng: number) {
    if (!inBounds(lat, lng)) {
      setOutOfBounds(true)
      setCoords(null)
      return
    }
    setOutOfBounds(false)
    setCoords({ lat, lng })
    void reverseGeocode(lat, lng)
  }

  function useGps() {
    if (!navigator.geolocation) {
      setMapError('Peramban tidak mendukung GPS.')
      return
    }
    setMapError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        setShowMap(true)
        handleCoords(lat, lng)
        if (mapInstRef.current && markerRef.current) {
          mapInstRef.current.setView([lat, lng], 15)
          markerRef.current.setLatLng([lat, lng])
        }
      },
      () => setMapError('Tidak bisa mengambil lokasi GPS. Coba pilih di peta.'),
    )
  }

  // ── Leaflet init ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showMap) {
      mapInstRef.current?.remove()
      mapInstRef.current = null
      markerRef.current = null
      return
    }
    if (!mapRef.current || mapInstRef.current) return

    injectLeafletCss()
    let cancelled = false

    void import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return

      delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })
        ._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      const initLat = coords?.lat ?? CENTER[0]
      const initLng = coords?.lng ?? CENTER[1]

      const maxBounds = L.latLngBounds(
        L.latLng(BOUNDS.south, BOUNDS.west),
        L.latLng(BOUNDS.north, BOUNDS.east),
      )

      const map = L.map(mapRef.current, {
        maxBounds,
        maxBoundsViscosity: 1.0,
        minZoom: 11,
        maxZoom: 18,
      }).setView([initLat, initLng], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
      }).addTo(map)

      const marker = L.marker([initLat, initLng], { draggable: true }).addTo(map)
      marker.on('dragend', () => {
        const ll = marker.getLatLng()
        handleCoords(ll.lat, ll.lng)
        if (!inBounds(ll.lat, ll.lng)) {
          marker.setLatLng(coords ? [coords.lat, coords.lng] : CENTER)
        }
      })

      map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        if (!inBounds(lat, lng)) {
          setOutOfBounds(true)
          return
        }
        marker.setLatLng(e.latlng)
        handleCoords(lat, lng)
      })

      map.on('moveend', () => {
        const c = map.getCenter()
        const clampedLat = Math.min(BOUNDS.north, Math.max(BOUNDS.south, c.lat))
        const clampedLng = Math.min(BOUNDS.east, Math.max(BOUNDS.west, c.lng))
        if (clampedLat !== c.lat || clampedLng !== c.lng) {
          map.panTo([clampedLat, clampedLng], { animate: false })
        }
      })

      mapInstRef.current = map
      markerRef.current = marker
    })

    return () => {
      cancelled = true
      mapInstRef.current?.remove()
      mapInstRef.current = null
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showMap])

  useEffect(() => {
    if (!coords || !markerRef.current || !mapInstRef.current) return
    markerRef.current.setLatLng([coords.lat, coords.lng])
    mapInstRef.current.setView([coords.lat, coords.lng], 15)
  }, [coords])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const fd = new FormData(e.currentTarget)
    if (coords) {
      fd.set('latitude', String(coords.lat))
      fd.set('longitude', String(coords.lng))
    }
    await updateProfilPelanggan(fd)
    setSubmitting(false)
  }

  const inputCls =
    'w-full rounded-xl border-0 bg-[#f1f4fc] px-4 py-3 text-[15px] font-normal text-slate-800 outline-none transition placeholder:text-slate-500 focus:bg-white focus:ring-2 focus:ring-[#6741f5]/25'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* No. HP */}
      <div>
        <label className="mb-1.5 block text-[14px] font-medium text-slate-700">
          No. HP
        </label>
        <input
          name="no_hp"
          type="tel"
          inputMode="numeric"
          pattern="[0-9]+"
          maxLength={12}
          placeholder="Contoh: 08123456789"
          defaultValue={noHp}
          onInput={(e) => {
            const el = e.currentTarget
            el.value = el.value.replace(/\D/g, '').slice(0, 12)
          }}
          required
          className={inputCls}
        />
      </div>

      {/* Lokasi Map */}
      <div>
        <p className="mb-2 text-[14px] font-medium text-slate-700">
          Lokasi Pemasangan
        </p>

        {/* Koordinat saat ini (jika ada) */}
        {coords && (
          <p className="mb-2 text-xs text-emerald-700">
            Koordinat tersimpan: {coords.lat.toFixed(5)},{' '}
            {coords.lng.toFixed(5)}
          </p>
        )}
        {!coords && latitude && longitude && (
          <p className="mb-2 text-xs text-gray-500">
            Koordinat lama: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={useGps}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#dfe5ef] px-3 text-sm font-semibold text-[#6741f5] transition hover:bg-slate-50"
          >
            <MapPin size={14} /> Gunakan GPS
          </button>
          <button
            type="button"
            onClick={() => {
              setMapError('')
              setOutOfBounds(false)
              setShowMap((v) => !v)
            }}
            className="h-10 rounded-xl bg-[#6741f5] px-3 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6]"
          >
            {showMap ? 'Sembunyikan Peta' : 'Pilih di Peta'}
          </button>
        </div>
      </div>

      {/* Leaflet Map */}
      {showMap && (
        <div className="space-y-1.5">
          <div
            ref={mapRef}
            className="h-[260px] w-full overflow-hidden rounded-[18px] border border-[#e5e7eb]"
          />
          {outOfBounds && (
            <p className="text-xs text-red-600">
              Lokasi di luar wilayah Kabupaten Padang Pariaman. Pilih titik yang benar.
            </p>
          )}
          {!outOfBounds && coords && (
            <p className="text-xs text-emerald-700">
              Lokasi baru dipilih: {coords.lat.toFixed(5)},{' '}
              {coords.lng.toFixed(5)}
            </p>
          )}
        </div>
      )}

      {mapError && (
        <p className="text-xs text-red-600">{mapError}</p>
      )}

      {/* Hidden inputs koordinat (fallback ke nilai lama bila tidak diubah) */}
      <input
        type="hidden"
        name="latitude"
        value={coords?.lat ?? latitude ?? ''}
      />
      <input
        type="hidden"
        name="longitude"
        value={coords?.lng ?? longitude ?? ''}
      />

      {/* Alamat Pemasangan */}
      <div>
        <label className="mb-1.5 block text-[14px] font-medium text-slate-700">
          Alamat Pemasangan
        </label>
        <textarea
          name="alamat_pemasangan"
          rows={4}
          required
          value={alamatValue}
          onChange={(e) => setAlamatValue(e.target.value)}
          className={inputCls}
        />
        <p className="mt-1 text-xs text-slate-400">
          Alamat akan otomatis terisi saat kamu memilih titik di peta.
        </p>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#6741f5] px-6 text-[15px] font-semibold text-white shadow-[0_10px_22px_rgba(103,65,245,0.18)] transition hover:bg-[#5b2fd6] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting && <Loader2 size={14} className="animate-spin" />}
        Simpan Perubahan
      </button>
    </form>
  )
}
