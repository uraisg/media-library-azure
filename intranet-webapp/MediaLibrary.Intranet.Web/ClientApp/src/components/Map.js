import React, { useEffect, useRef } from 'react'
import styled from 'styled-components'
import L from 'leaflet'
import { useMap, useInitMap } from '@/contexts'

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
`

const basemap = L.tileLayer(
  'https://maps-{s}.onemap.sg/v3/Grey/{z}/{x}/{y}.png',
  {
    detectRetina: true,
    maxZoom: 18,
    minZoom: 11,
    attribution:
      '<img src="https://docs.onemap.sg/maps/images/oneMap64-01.png" style="height:20px;width:20px;"/> \
      New OneMap | Map data &copy; contributors, <a href="https://www.sla.gov.sg">Singapore Land Authority</a>',
  }
)

const placesLayer = L.featureGroup()

const mapOptions = {
  center: L.latLngBounds([1.56073, 104.11475], [1.16, 103.502]).getCenter(),
  zoom: 12,
  maxBounds: L.latLngBounds([1.56073, 104.11475], [1.16, 103.502]),
  layers: [placesLayer, basemap],
}

const Map = () => {
  const mapRef = useRef(null)
  const map = useMap()
  const initMap = useInitMap()

  useEffect(() => {
    if (map === undefined) {
      const newMap = L.map(mapRef.current, mapOptions)
      initMap(newMap)
    }
  }, [])

  return <MapContainer ref={mapRef} />
}

export default Map
