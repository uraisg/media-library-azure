import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import TopBar from '@/components/TopBar'
import Map from '@/components/Map'
import FilterSettings from '@/components/FilterSettings'
import SearchResultsView from '@/components/SearchResultsView'
import { changePage, getSearchResults, selectSearchResult } from '@/slices/gallerySlice'
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

  const { searchTerm, filters, isFetching, results } = useSelector((state) => state.gallery)
  const areas = useSelector((state) => state.areas)

  const map = useMap()

  const setSearchTerm = (searchTerm) => {
    dispatch(getSearchResults(searchTerm, filters, map))
  }

  const setFilters = (filters) => {
    dispatch(getSearchResults(searchTerm, filters, map))
  }

  const setPage = (page) => {
    dispatch(changePage({ page }))
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
    dispatch(getSearchResults(searchTerm, filters, map))
  }, [dispatch])

  return (
    <LayoutContainer>
      <TopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <MainContainer>
        <Sidebar>
          <FilterSettings filters={filters} setFilters={setFilters} areas={areas} />
          <SearchResultsView isFetching={isFetching} results={results} />
        </Sidebar>
        <NotSidebar>
          <Map results={results} onMapClick={handleMapClick} onMarkerClick={handleMarkerClick} />
        </NotSidebar>
      </MainContainer>
    </LayoutContainer>
  )
}

export default GalleryPage
