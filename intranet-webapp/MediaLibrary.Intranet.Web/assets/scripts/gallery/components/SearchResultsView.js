import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import ReactPaginate from 'react-paginate'
import DelayedSpinner from '@/components/DelayedSpinner'
import MediaGrid from '@/components/MediaGrid'
import MediaList from '@/components/MediaList'

const Container = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 0 1rem 1rem;
`

const Message = styled.div`
  margin: 4rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30rem;
  max-width: 100%;
`

const SearchResultsView = ({
  isFetching,
  results,
  page,
  totalPages,
  onPageChange,
  gridView,
}) => {
  const [currentResults, setCurrentResults] = useState(results)

  useEffect(() => {
    setCurrentResults(JSON.parse(JSON.stringify(results)))
  }, [results])

  const MediaViewComponent = gridView ? MediaGrid : MediaList

  return (
    <Container>
      {isFetching && (
        <Message>
          <DelayedSpinner />
        </Message>
      )}
      {!isFetching && currentResults?.length == 0 && (
        <Message>
          <div className="text-secondary">
            {/* prettier-ignore */}
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="currentColor" className="bi bi-funnel" viewBox="0 0 16 16">
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z"/>
            </svg>
          </div>

          <p className="h4 my-2 text-center">No matching results found</p>
          <p className="text-center text-secondary">
            Try changing your filter settings
          </p>
        </Message>
      )}
      {!isFetching && currentResults?.length > 0 && (
        <>
          <nav>
            <ReactPaginate
              containerClassName="pagination pagination-sm"
              breakClassName="page-item"
              breakLinkClassName="page-link"
              pageClassName="page-item"
              previousClassName="page-item"
              nextClassName="page-item"
              pageLinkClassName="page-link"
              previousLinkClassName="page-link"
              nextLinkClassName="page-link"
              activeClassName="active"
              onPageChange={onPageChange}
              forcePage={page - 1}
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
            />
          </nav>

          <MediaViewComponent results={currentResults} />
        </>
      )}
    </Container>
  )
}

SearchResultsView.propTypes = {
  isFetching: PropTypes.bool,
  results: PropTypes.array,
  page: PropTypes.number,
  totalPages: PropTypes.number,
  onPageChange: PropTypes.func,
  gridView: PropTypes.bool,
}

export default SearchResultsView
