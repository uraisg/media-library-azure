import { combineReducers } from '@reduxjs/toolkit'
import galleryReducer from '@/slices/gallerySlice'

const rootReducer = combineReducers({
  gallery: galleryReducer,
})

export default rootReducer
