import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import TopBar from '@/components/TopBar'
import Map from '@/components/Map'
import FilterSettings from '@/components/FilterSettings'
import SearchResultsView from '@/components/SearchResultsView'
import {
  SpatialFilters,
  DateFilters,
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
    const searchParams = new URLSearchParams(location.search)
    if (searchTerm) {
      searchParams.set('q', searchTerm)
    } else {
      searchParams.delete('q')
    }

    if (newFilters.spatial) {
      searchParams.delete('postalCode')
      searchParams.delete('area')
      if (newFilters.spatial.type === SpatialFilters.Postal) {
        searchParams.set('postalCode', newFilters.spatial.postalCode)
      } else if (newFilters.spatial.type === SpatialFilters.Area) {
        searchParams.set('area', newFilters.spatial.areaName)
      }
    }

    if (newFilters.temporal) {
      searchParams.delete('uploadeddate')
      searchParams.delete('takendate')
      if (newFilters.temporal.type === DateFilters.Uploaded) {
        searchParams.set(
          'uploadeddate',
          newFilters.temporal.dateFrom + '_' + newFilters.temporal.dateTo
        )
        searchParams.delete('takendate')
      } else if (newFilters.temporal.type === DateFilters.Taken) {
        searchParams.set(
          'takendate',
          newFilters.temporal.dateFrom + '_' + newFilters.temporal.dateTo
        )
        searchParams.delete('uploadeddate')
      }
    }

    // Always reset page number after applying new filters
    searchParams.delete('page')

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

  const handleMapClick = () => {
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

    let spatial = { type: SpatialFilters.All }
    if (postalCode) {
      spatial = { type: SpatialFilters.Postal, postalCode }
    }
    if (areaName) {
      spatial = { type: SpatialFilters.Area, areaName }
    }

    let temporal = { type: DateFilters.All }
    if (uploaddate) {
      const [dateFrom, dateTo] = uploaddate.split('_')
      temporal = { type: DateFilters.Uploaded, dateFrom, dateTo }
    }
    if (takendate) {
      const [dateFrom, dateTo] = takendate.split('_')
      temporal = { type: DateFilters.Taken, dateFrom, dateTo }
    }

    const filters = { spatial, temporal }
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
