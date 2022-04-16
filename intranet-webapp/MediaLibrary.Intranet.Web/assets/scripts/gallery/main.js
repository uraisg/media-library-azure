import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import App from '@/components/App'

import store from '@/store'
import { fetchAreas } from '@/slices/areasSlice'

store.dispatch(fetchAreas())

render(
  <Provider store={store}>
    <Router basename={window.location.pathname}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
)
