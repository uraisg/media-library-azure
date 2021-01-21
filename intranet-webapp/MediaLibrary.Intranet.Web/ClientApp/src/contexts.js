import { createContext, useContext, useState } from 'react'

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

const useMap = () => {
  return useContext(MapContext).map
}

const useInitMap = () => {
  return useContext(MapContext).initMap
}

export { MapContext, MapProvider, useMap, useInitMap }
