import { createSlice, createEntityAdapter } from '@reduxjs/toolkit'
import { queryPostalCode } from '@/api/onemap'

export const SpatialFilters = {
  All: 'none',
  Postal: 'postal',
  Area: 'area',
}

export const DateFilters = {
  All: 'none',
  Uploaded: 'uploaded',
  Taken: 'taken',
}

const galleryAdapter = createEntityAdapter()

const initialState = galleryAdapter.getInitialState({
  searchTerm: '',
  filters: {
    spatial: {
      type: SpatialFilters.All,
      // postalCode: '609601',
      // areaName: 'JURONG',
    },
    temporal: {
      type: DateFilters.All,
      // dateFrom: '2017-06-01',
      // dateTo: '2021-06-01',
    },
    filterType: '', // 'uploaded', or 'taken'
    date1: '', //refers to date (from)
    date2: '', //refers to date (to)
  },
  page: 1,
  totalPages: null,
  boundingbox: '',
  isFetching: false,
  results: null,
  error: null,
  gridView: true,
})

const gallerySlice = createSlice({
  name: 'gallery',
  initialState,
  reducers: {
    displayMedia(state, action) {
      const { searchTerm, filters, page } = action.payload
      state.searchTerm = searchTerm
      state.filters = filters
      state.page = page
    },
    getSearchResultsRequest(state, action) {
      state.isFetching = true
    },
    getSearchResultsSuccess(state, action) {
      state.isFetching = false
      state.results = action.payload.results
      state.totalPages = action.payload.totalPages
      state.error = null
    },
    getSearchResultsFailed(state, action) {
      state.isFetching = false
      state.results = []
      state.error = action.payload
    },
    selectSearchResult(state, action) {
      state.results.forEach((result) => {
        if (result.id === action.payload) {
          result.isSelected = true
        } else if (result.isSelected) {
          result.isSelected = false
        }
      })
    },
    setGridView(state, action) {
      state.gridView = !!action.payload
    },
  },
})

export const {
  displayMedia,
  changePage,
  getSearchResultsRequest,
  getSearchResultsSuccess,
  getSearchResultsFailed,
  selectSearchResult,
  setGridView,
} = gallerySlice.actions

export default gallerySlice.reducer

export const getSearchResults = (searchTerm, filters, page = 1) => {
  return async (dispatch, getState) => {
    // First, update search parameters in state
    dispatch(displayMedia({ searchTerm, filters, page }))
    // Inform app that a search request is being made
    dispatch(getSearchResultsRequest())

    // Call the search API
    let results
    let totalPages
    try {
      const data = await getSearchResultsApi(searchTerm, filters, page)
      results = processData(data)
      totalPages = data.TotalPages
    } catch (err) {
      dispatch(getSearchResultsFailed(err.toString()))
      // TODO: add default error slice
      throw err
    }

    dispatch(getSearchResultsSuccess({ results, totalPages }))
  }
}

const getSearchResultsApi = async (searchTerm, filters, page) => {
  const baseUrl = location
  const url = new URL('/api/search', baseUrl)
  const params = {
    SearchText: searchTerm,
    Page: page,
  }

  // Convert filters to search API parameters
  if (filters.spatial.type === SpatialFilters.Postal) {
    const [lng, lat] = await queryPostalCode(filters.spatial.postalCode)
    params.Lng = lng
    params.Lat = lat
  } else if (filters.spatial.type === SpatialFilters.Area) {
    params.SpatialFilter = filters.spatial.areaName
  }

  if (filters.filterType === 'uploaded') {
    console.log(Date.parse(filters.date1))
    //converts date to long and divides by ms to s
    params.mindatetaken = (Date.parse(filters.date1)) / 1000
    params.maxdatetaken = (Date.parse(filters.date2)) / 1000
  } else if (filters.filterType === 'taken') {
    //converts date to long and divides by ms to s
    params.mindatetaken = (Date.parse(filters.date1)) / 1000
    params.maxdatetaken = (Date.parse(filters.date2)) / 1000
  } 



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
      name: doc.Name,
      caption: doc.Caption,
      link: new URL('/Gallery/Item/' + doc.Id, window.location).toString(),
      location: doc.Location,
      isSelected: false,
    }
  })
}
