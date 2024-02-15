import React from 'react'
import { Switch, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import FolderList from './FolderDisplay'
import FolderDetailsTable from './FolderDetails'
import { FolderProvider } from './context';

const App = () => {
  return (
    <Container className="mt-3">
      <FolderProvider>
        <Switch>
          <Route exact path="/Folder">
            <FolderList />
          </Route>
          <Route path="/folder-details/:id">
            <FolderDetailsTable />
          </Route>
        </Switch>
      </FolderProvider>
      </Container>
  )
}

export default App
