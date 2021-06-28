import { combineReducers } from '@reduxjs/toolkit'
import galleryReducer from '@/slices/gallerySlice'
import areasReducer from '@/slices/areasSlice'

const rootReducer = combineReducers({
  gallery: galleryReducer,
  areas: areasReducer,
})

export default rootReducer
