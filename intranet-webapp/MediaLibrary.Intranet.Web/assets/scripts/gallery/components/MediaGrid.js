import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Gallery from 'react-grid-gallery'
import Button from 'react-bootstrap/Button'

const MediaGrid = ({ results, popupChecked }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const onCurrentImageChange = (index) => {
    setCurrentIndex(index)
  }

  const showDetails = () => {
    document.location = results[currentIndex].link
  }

  const showDetailsNoPopup = (index) => {
    document.location = results[index].link
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
    <div>
      {popupChecked ?
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
        :
        <Gallery
          images={results}
          enableLightbox={false}
          backdropClosesModal={false}
          enableImageSelection={false}
          onClickThumbnail={index => showDetailsNoPopup(index)}
        />
      }
    </div>
  )
}

MediaGrid.propTypes = {
  results: PropTypes.array,
  popupChecked: PropTypes.bool,
}

export default MediaGrid
