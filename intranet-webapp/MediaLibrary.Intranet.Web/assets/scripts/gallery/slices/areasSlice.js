import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const initialState = []

export const fetchAreas = createAsyncThunk('areas/fetchAreas', async () => {
  const response = await fetch('/api/areas', {
    mode: 'same-origin',
    credentials: 'same-origin',
  })
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`)
  }
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new TypeError("Oops, we haven't got JSON!")
  }

  return response.json()
})

const areasSlice = createSlice({
  name: 'areas',
  initialState,
  reducers: {},
  extraReducers: {
    [fetchAreas.fulfilled]: (state, action) => {
      return action.payload
    },
  },
})

export default areasSlice.reducer
