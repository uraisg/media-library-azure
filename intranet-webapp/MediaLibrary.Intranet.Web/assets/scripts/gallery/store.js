import { configureStore } from '@reduxjs/toolkit'

import galleryReducer from '@/slices/gallerySlice'
import areasReducer from '@/slices/areasSlice'

const store = configureStore({
  reducer: {
    gallery: galleryReducer,
    areas: areasReducer,
  },
})

export default store
