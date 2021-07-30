import React from 'react'
import { Switch, Route, useLocation } from 'react-router-dom'
import { MapProvider } from '@/contexts'
import GalleryPage from '@/components/GalleryPage'
import Modal from '@/components/Modal'

const App = () => {
  // const location = useLocation()
  // const background = location.state && location.state.background

  return (
    <>
      <Switch>
        <Route exact path="/">
          <MapProvider>
            <GalleryPage />
          </MapProvider>
        </Route>
      </Switch>
      {/* {background && <Route path="/Gallery/Item/:id" children={<Modal />} />} */}
    </>
  )
}

export default App
