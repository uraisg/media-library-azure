import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Gallery from 'react-grid-gallery'
import Button from 'react-bootstrap/Button'

const MediaGrid = ({ results }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const onCurrentImageChange = (index) => {
    setCurrentIndex(index)
  }

  const showDetails = () => {
    document.location = results[currentIndex].link
  }

  // Use name as caption in modal
  results = results.map((result) => {
    const name = result.name
    return {
      ...result,
      caption: name,
      thumbnailWidth: 320,
      thumbnailHeight: 240,
    }
  })

  return (
    <Gallery
      images={results}
      enableLightbox={true}
      backdropClosesModal={true}
      enableImageSelection={false}
      currentImageWillChange={onCurrentImageChange}
      customControls={[
        <Button
          size="sm"
          variant="light"
          key="showDetails"
          onClick={showDetails}
        >
          Show details
        </Button>,
      ]}
    />
  )
}

MediaGrid.propTypes = {
  results: PropTypes.array,
}

export default MediaGrid
