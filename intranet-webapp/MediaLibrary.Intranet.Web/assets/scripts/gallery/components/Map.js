import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@linaria/react'
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

const SmallLIcon = L.Icon.extend({
  options: {
    iconSize: [19, 33],
    iconAnchor: [9, 33],
    popupAnchor: [0, -25],
    tooltipAnchor: [12, -22],
  },
})

const notSelectedIcon = new SmallLIcon({
  iconUrl: '../images/marker-icon.png',
  iconRetinaUrl: '../images/marker-icon-2x.png',
})

const selectedIcon = new SmallLIcon({
  iconUrl: '../images/marker-icon-orange.png',
  iconRetinaUrl: '../images/marker-icon-orange-2x.png',
})

const placesLayer = L.featureGroup()

const defaultMapBounds = L.latLngBounds([1.56073, 104.11475], [1.16, 103.502])

const mapOptions = {
  center: defaultMapBounds.getCenter(),
  zoom: 12,
  maxBounds: defaultMapBounds,
  layers: [placesLayer, basemap],
}

const Map = ({ results, onMapClick, onMarkerClick }) => {
  const mapRef = useRef(null)
  const map = useMap()
  const initMap = useInitMap()

  const prevResultIdsRef = useRef()
  useEffect(() => {
    prevResultIdsRef.current = results?.map((result) => result.id)
  })
  const prevResultIds = prevResultIdsRef.current

  // Initialise map
  useEffect(() => {
    if (map === undefined) {
      const newMap = L.map(mapRef.current, mapOptions)

      newMap.zoomControl.setPosition('topright')

      if (onMapClick) {
        newMap.on('click', onMapClick)
      }

      initMap(newMap)
    }
  }, [])

  useEffect(() => {
    if (!results) {
      return
    }

    for (const result of results) {
      const pointFeature = result.location
      if (pointFeature) {
        // for every location in results we will add a marker
        const marker = L.marker(
          [pointFeature.coordinates[1], pointFeature.coordinates[0]],
          {
            icon: result.isSelected ? selectedIcon : notSelectedIcon,
            bubblingMouseEvents: false,
          }
        )
        marker.data = result
        if (onMarkerClick) {
          marker.on('click', onMarkerClick)
        }

        marker.addTo(placesLayer)
      }
    }

    const resultIds = results.map((result) => result.id)
    const equalIds =
      !prevResultIds ||
      (resultIds.length === prevResultIds.length &&
        resultIds.every((v, i) => v === prevResultIds[i]))

    // Zoom to layer if ids are different (not just a selection change)
    if (!equalIds) {
      const layerBounds = placesLayer.getBounds()
      map.fitBounds(layerBounds.isValid() ? layerBounds : defaultMapBounds)
    }

    return () => {
      // Remove existing markers
      placesLayer.clearLayers()
    }
  }, [results])

  return <MapContainer ref={mapRef} />
}

Map.propTypes = {
  results: PropTypes.array,
  onMapClick: PropTypes.func,
  onMarkerClick: PropTypes.func,
}

export default Map
