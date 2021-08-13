import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { MapProvider } from '@/contexts'
import GalleryPage from '@/components/GalleryPage'

const App = () => {
  return (
    <Switch>
      <Route exact path="/">
        <MapProvider>
          <GalleryPage />
        </MapProvider>
      </Route>
    </Switch>
  )
}

export default App
