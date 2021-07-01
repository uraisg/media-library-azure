import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Gallery from 'react-grid-gallery'
import Button from 'react-bootstrap/Button'
import DelayedSpinner from '@/components/DelayedSpinner'

const Container = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem 15px;
`

const Message = styled.div`
  margin: 4rem auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 30rem;
  max-width: 100%;
`

const SearchResultsView = ({ isFetching, results }) => {
  const [currentResults, setCurrentResults] = useState(results)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    setCurrentResults(JSON.parse(JSON.stringify(results)))
  }, [results])

  const onCurrentImageChange = (index) => {
    setCurrentIndex(index)
  }

  const showDetails = () => {
    document.location = currentResults[currentIndex].link
  }

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="128"
              height="128"
              fill="currentColor"
              className="bi bi-funnel"
              viewBox="0 0 16 16"
            >
              <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" />
            </svg>
          </div>

          <p className="h4 my-2 text-center">No matching results found</p>
          <p className="text-center text-secondary">
            Try changing your filter settings
          </p>
        </Message>
      )}
      {!isFetching && currentResults?.length > 0 && (
        <Gallery
          images={currentResults}
          enableLightbox={true}
          enableImageSelection={false}
          currentImageWillChange={onCurrentImageChange}
          customControls={[
            <Button variant="light" key="showDetails" onClick={showDetails}>
              Show details
            </Button>,
          ]}
        />
      )}
    </Container>
  )
}

// SearchResultsView.propTypes = {
//   results: PropTypes.arrayOf(
//     PropTypes.shape({
//       src: PropTypes.string.isRequired,
//       thumbnail: PropTypes.string.isRequired,
//       srcset: PropTypes.array,
//       caption: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
//       thumbnailWidth: PropTypes.number.isRequired,
//       thumbnailHeight: PropTypes.number.isRequired,
//     })
//   ).isRequired,
// }

export default SearchResultsView
