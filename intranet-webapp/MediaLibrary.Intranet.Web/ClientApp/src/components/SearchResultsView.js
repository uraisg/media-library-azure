import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Gallery from 'react-grid-gallery'
import Button from 'react-bootstrap/Button'

const Container = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem 15px;
`

const SearchResultsView = ({ results }) => {
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
      <Gallery
        images={currentResults}
        enableLightbox={true}
        enableImageSelection={false}
        currentImageWillChange={onCurrentImageChange}
        customControls={[
          <Button variant="light" key="showDetails" onClick={showDetails}>Show details</Button>
        ]}
      />
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
