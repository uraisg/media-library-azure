import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import { queryPostalCode } from '@/api/geospace'

const galleryAdapter = createEntityAdapter()

const initialState = galleryAdapter.getInitialState({
  searchTerm: '',
  filters: {
    filterType: 'none', // 'postal', 'area', or 'none'
    // postalCode: '120307',
    // areaName: 'JURONG',
  },
  page: 1,
  boundingbox: '',
  isFetching: false,
  results: null,
  error: null,
})

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    displayMedia(state, action) {
      const { searchTerm, filters } = action.payload
      state.searchTerm = searchTerm
      state.filters = filters
    },
    changePage(state, action) {
      state.page = action.payload.page
    },
    getSearchResultsRequest(state, action) {
      state.isFetching = true
    },
    getSearchResultsSuccess(state, action) {
      state.isFetching = false
      state.results = action.payload.results
      state.error = null
    },
    getSearchResultsFailed(state, action) {
      state.isFetching = false
      state.results = []
      state.error = action.payload
    },
  },
})

export const {
  displayMedia,
  changePage,
  getSearchResultsRequest,
  getSearchResultsSuccess,
  getSearchResultsFailed,
} = gallerySlice.actions

export default gallerySlice.reducer

export const getSearchResults = (searchTerm, filters, map) => {
  return async (dispatch, getState) => {
    // First, update search parameters in state
    dispatch(displayMedia({ searchTerm, filters }))
    // Inform app that a search request is being made
    dispatch(getSearchResultsRequest())

    // Call the search API
    let results
    try {
      const data = await getSearchResultsApi(searchTerm, filters)
      results = processData(data)
    } catch (err) {
      dispatch(getSearchResultsFailed(err.toString()))
      // TODO: add default error slice
      throw err
    }

    dispatch(getSearchResultsSuccess({ results }))
  }
}

const getSearchResultsApi = async (searchTerm, filters, page = 1) => {
  const baseUrl = location
  const url = new URL('/api/search', baseUrl)
  const params = {
    SearchText: searchTerm,
    Page: page,
  }

  // Convert filters to search API parameters
  if (filters.filterType === 'postal') {
    const [lng, lat] = await queryPostalCode(filters.postalCode)
    params.Lng = lng
    params.Lat = lat
  } else if (filters.filterType === 'area') {
    params.SpatialFilter = filters.areaName
  }

  console.log(params)
  url.search = new URLSearchParams(params)

  const response = await fetch(url, {
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
}

const processData = (data) => {
  // return {
  //   byId: {},
  //   allIds: [],
  //   page: data.Page,
  //   totalPages: data.PageCount
  // }
  return data.Items.map((doc) => {
    return {
      id: doc.Id,
      src: new URL(doc.FileURL, window.location).toString(),
      thumbnail: new URL(doc.ThumbnailURL, window.location).toString(),
      caption: doc.Name,
      thumbnailWidth: 320,
      thumbnailHeight: 240,
      link: new URL('/Gallery/Item/' + doc.Id, window.location).toString(),
      location: doc.Location,
    }
  })
}
