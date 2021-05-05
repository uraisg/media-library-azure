import React from 'react'
import { render } from 'react-dom'
import { BrowserRouter as Router } from 'react-router-dom'
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import rootReducer from '@/reducers'
import App from '@/components/App'

const store = configureStore({
  reducer: rootReducer,
})

render(
  <Provider store={store}>
    <Router basename="/s">
      <App />
    </Router>
  </Provider>,
  document.getElementById('root')
)
