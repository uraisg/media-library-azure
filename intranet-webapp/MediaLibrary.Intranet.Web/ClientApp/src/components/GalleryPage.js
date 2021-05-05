import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components'
import TopBar from '@/components/TopBar'
import Map from '@/components/Map'
import FilterSettings from '@/components/FilterSettings'
import { displayMedia, changePage, getSearchResults } from '@/slices/gallerySlice'
import { useMap } from '@/contexts'

const LayoutContainer = styled.div`
  min-height: calc(100vh - 3.5rem);
  display: flex;
  flex-direction: column;
`

const MainContainer = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: row;
`

const Sidebar = styled.div`
  flex: 0 0 33.333333%;
  display: flex;
  flex-direction: column;
`

const NotSidebar = styled.div`
  flex: 0 0 66.666667%;
  min-width: 50%;
`

const GalleryPage = () => {
  const dispatch = useDispatch()

  const { searchTerm, filters } = useSelector((state) => state.gallery)

  const map = useMap()

  const setSearchTerm = (searchTerm) => {
    dispatch(getSearchResults(searchTerm, filters, map))
    // dispatch(displayMedia({ searchTerm, filters }))
  }

  const setFilters = (filters) => {
    dispatch(getSearchResults(searchTerm, filters, map))
    // dispatch(displayMedia({ searchTerm, filters }))
  }

  const setPage = (page) => {
    dispatch(changePage({ page }))
  }

  return (
    <LayoutContainer>
      <TopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <MainContainer>
        <Sidebar>
          <FilterSettings filters={filters} setFilters={setFilters} />
          {/* <SearchResultsView
          searchTerm={searchTerm}
          filters={filters}
          page={page}
          setPage={setPage}
          /> */}
        </Sidebar>
        <NotSidebar>
          <Map />
        </NotSidebar>
      </MainContainer>
    </LayoutContainer>
  )
}

export default GalleryPage
