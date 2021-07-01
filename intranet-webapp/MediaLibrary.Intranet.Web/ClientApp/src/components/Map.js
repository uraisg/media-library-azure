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

const defaultMapBounds = L.latLngBounds([1.56073, 104.11475], [1.16, 103.502])

const mapOptions = {
  center: defaultMapBounds.getCenter(),
  zoom: 12,
  maxBounds: defaultMapBounds,
  layers: [placesLayer, basemap],
}

const markerClick = (e) => {
  console.log(e)
  // TODO: dispatch action to scroll and select photo in SearchResultView
}

const Map = ({ results }) => {
  const mapRef = useRef(null)
  const map = useMap()
  const initMap = useInitMap()

  useEffect(() => {
    if (map === undefined) {
      const newMap = L.map(mapRef.current, mapOptions)

      newMap.zoomControl.setPosition('topright')

      initMap(newMap)
    }
  }, [])

  useEffect(() => {
    // Remove existing markers
    placesLayer.clearLayers()

    if (!results) {
      return
    }

    for (const result of results) {
      const pointFeature = result.location
      if (pointFeature) {
        // for every location in results we will add a circlemarker
        L.circleMarker(
          [pointFeature.coordinates[1], pointFeature.coordinates[0]],
          {
            radius: 5,
            weight: 1,
            fillOpacity: 0.5,
          }
        )
          .addTo(placesLayer)
          .on('click', markerClick)
      }
    }

    // Zoom to layer
    const layerBounds = placesLayer.getBounds()
    map.fitBounds(layerBounds.isValid() ? layerBounds : defaultMapBounds)
  }, [results])

  return <MapContainer ref={mapRef} />
}

export default Map
