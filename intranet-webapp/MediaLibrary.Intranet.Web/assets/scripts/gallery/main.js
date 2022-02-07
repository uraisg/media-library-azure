import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import rootReducer from '@/reducers'
import App from '@/components/App'

import { fetchAreas } from '@/slices/areasSlice'

const store = configureStore({
  reducer: rootReducer,
})

store.dispatch(fetchAreas())

render(
  <Provider store={store}>
    <Router basename={window.location.pathname}>
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
)
