import React, { createContext, useContext, useState } from 'react'
import PropTypes from 'prop-types'

const MapContext = createContext({
  map: undefined,
  initMap: () => {},
})

const MapProvider = ({ children }) => {
  const [map, setMap] = useState()
  const value = {
    map,
    initMap: (newMap) => {
      if (newMap === undefined) {
        throw new Error('Map parameter is missing')
      }
      if (map !== undefined) {
        throw new Error('Map has been set before')
      }
      setMap(newMap)
    },
  }

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>
}

MapProvider.propTypes = {
  children: PropTypes.element,
}

const useMap = () => {
  return useContext(MapContext).map
}

const useInitMap = () => {
  return useContext(MapContext).initMap
}

export { MapContext, MapProvider, useMap, useInitMap }
