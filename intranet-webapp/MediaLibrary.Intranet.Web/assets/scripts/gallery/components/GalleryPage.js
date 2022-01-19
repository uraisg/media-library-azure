import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import TopBar from '@/components/TopBar'
import Map from '@/components/Map'
import FilterSettings from '@/components/FilterSettings'
import SearchResultsView from '@/components/SearchResultsView'
import {
  getSearchResults,
  selectSearchResult,
  setGridView,
} from '@/slices/gallerySlice'

const LayoutContainer = styled.div`
  height: calc(100vh - 4.5625rem);
  display: flex;
  flex-direction: column;
`

const MainContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
  overflow: auto;
`

const Sidebar = styled.div`
  flex: 0 0 60%;
  display: flex;
  flex-direction: column;
`

const NotSidebar = styled.div`
  flex: 0 0 40%;
  min-width: 25%;
`

const GalleryPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()

  const {
    searchTerm,
    filters,
    isFetching,
    results,
    page,
    totalPages,
    gridView,
  } = useSelector((state) => state.gallery)
  const areas = useSelector((state) => state.areas)

  const setSearchTerm = (newSearchTerm) => {
    const searchParams = new URLSearchParams()
    if (newSearchTerm) {
      searchParams.set('q', newSearchTerm)
    }
    history.push({
      search: `?${searchParams}`,
    })
  }

  const setFilters = (newFilters) => {
    const searchParams = new URLSearchParams({
      q: searchTerm,
    })
    if (newFilters.filterType === 'postal') {
      searchParams.set('postalCode', newFilters.postalCode)
    } else if (newFilters.filterType === 'area') {
      searchParams.set('area', newFilters.areaName)
    } else if (newFilters.filterType === 'uploaded') {
      searchParams.set('uploadeddate', newFilters.date1 + ';' + newFilters.date2)
    } else if (newFilters.filterType === 'taken') {
      searchParams.set('takendate', newFilters.date1 + ';' + newFilters.date2)
    }
    history.push({
      search: `?${searchParams}`,
    })
  }

  const setPage = (data) => {
    const selectedPage = data.selected + 1
    const searchParams = new URLSearchParams(location.search)
    searchParams.set('page', selectedPage)
    history.push({
      search: `?${searchParams}`,
    })
  }

  const handleMapClick = (e) => {
    dispatch(selectSearchResult(null))
  }

  const handleMarkerClick = (e) => {
    const resultId = e.target.data.id
    dispatch(selectSearchResult(resultId))
    // TODO: scroll results view to selection
  }

  const handleSetView = (e) => {
    dispatch(setGridView(e))
  }

  useEffect(() => {
    // Extract search parameters from query string
    const searchParams = new URLSearchParams(location.search)

    const q = searchParams.get('q') || ''
    const page = searchParams.get('page') || 1
    const postalCode = searchParams.get('postalCode')
    const areaName = searchParams.get('area')
    const uploaddate = searchParams.get('uploadeddate')
    const takendate = searchParams.get('takendate')

    let filters = { filterType: 'none' }
    if (postalCode) {
      filters = { filterType: 'postal', postalCode }
    }
    if (areaName) {
      filters = { filterType: 'area', areaName }
    }
    if (uploaddate) {
      //split values from url and converts timestamp to long
      let date1 = uploaddate.split(';')[0]
      let date2 = uploaddate.split(';')[1]

      filters = { filterType: 'uploaded', date1, date2 }
    }
    if (takendate) {
      //split values from url and converts timestamp to long
      let date1 = takendate.split(';')[0]
      let date2 = takendate.split(';')[1]

      filters = { filterType: 'taken', date1, date2 }
    }
    dispatch(getSearchResults(q, filters, page))
  }, [location])

  return (
    <LayoutContainer>
      <TopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <MainContainer>
        <Sidebar>
          <FilterSettings
            filters={filters}
            setFilters={setFilters}
            areas={areas}
            gridView={gridView}
            onSetView={handleSetView}
          />
          <SearchResultsView
            isFetching={isFetching}
            results={results}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            gridView={gridView}
          />
        </Sidebar>
        <NotSidebar>
          <Map
            results={results}
            onMapClick={handleMapClick}
            onMarkerClick={handleMarkerClick}
          />
        </NotSidebar>
      </MainContainer>
    </LayoutContainer>
  )
}

export default GalleryPage
