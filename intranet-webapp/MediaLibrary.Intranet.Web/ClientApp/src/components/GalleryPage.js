import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import TopBar from '@/components/TopBar'
import Map from '@/components/Map'
import FilterSettings from '@/components/FilterSettings'
import SearchResultsView from '@/components/SearchResultsView'
import { getSearchResults, selectSearchResult } from '@/slices/gallerySlice'
import { useMap } from '@/contexts'

const LayoutContainer = styled.div`
  height: calc(100vh - 3.5rem);
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
  flex: 0 0 66.666667%;
  display: flex;
  flex-direction: column;
`

const NotSidebar = styled.div`
  flex: 0 0 33.333333%;
  min-width: 25%;
`

const GalleryPage = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const history = useHistory()

  const { searchTerm, filters, isFetching, results, page, totalPages } =
    useSelector((state) => state.gallery)
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

  useEffect(() => {
    // Extract search parameters from query string
    const searchParams = new URLSearchParams(location.search)

    const q = searchParams.get('q') || ''
    const page = searchParams.get('page') || 1
    const postalCode = searchParams.get('postalCode')
    const areaName = searchParams.get('area')

    let filters = { filterType: 'none' }
    if (postalCode) {
      filters = { filterType: 'postal', postalCode }
    }
    if (areaName) {
      filters = { filterType: 'area', areaName }
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
          />
          <SearchResultsView
            isFetching={isFetching}
            results={results}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
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
