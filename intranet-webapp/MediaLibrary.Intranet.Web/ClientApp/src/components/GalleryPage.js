import { useSelector, useDispatch } from 'react-redux'
import TopBar from '@/components/TopBar'
import Map from '@/components/Map'
import FilterSettings from '@/components/FilterSettings'
import { displayMedia, changePage, getSearchResults } from '@/slices/gallerySlice'
import { useMap } from '@/contexts'

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
    <>
      <TopBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <FilterSettings filters={filters} setFilters={setFilters} />
      {/* <SearchResultsView
      searchTerm={searchTerm}
      filters={filters}
      page={page}
      setPage={setPage}
    /> */}
      <Map />
    </>
  )
}

export default GalleryPage
