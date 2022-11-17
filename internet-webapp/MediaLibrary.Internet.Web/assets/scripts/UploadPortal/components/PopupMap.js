import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@linaria/react'
import Dropdown from 'react-bootstrap/Dropdown'
import SafeAnchor from 'react-bootstrap/SafeAnchor'

const ImageStack = styled.div`
  display: grid;
  height: 256px;
  width: 256px;

  img {
    grid-area: 1 / 1;

    &:not(:first-of-type) {
      opacity: 0;
      transition: opacity 0.3s;
    }
    &:not(:first-of-type).visible {
      opacity: 1;
    }
  }
`

const Circle = styled.span`
  width: 12px;
  height: 12px;
  position: absolute;
  z-index: 1;
  top: calc(50% - 6px);
  left: calc(50% - 6px);
  background-color: rgba(0, 77, 168, 0.8);
  border: 2px solid #333333;
  border-radius: 50%;
  pointer-events: none;
`

const DECIMAL_PLACES = 5

function formatLatLng(coords) {
  return (
    coords[1].toFixed(DECIMAL_PLACES) + ', ' + coords[0].toFixed(DECIMAL_PLACES)
  )
}

function getStaticMapUrl(coords, zoom) {
  const lat = coords[1].toFixed(DECIMAL_PLACES)
  const lng = coords[0].toFixed(DECIMAL_PLACES)
  return (
    'https://developers.onemap.sg/commonapi/staticmap/getStaticImage?layerchosen=default&' +
    `lat=${lat}&lng=${lng}&zoom=${zoom}&height=256&width=256`
  )
}

const PopupMap = ({ coordinates }) => {
  const coordinatesText = formatLatLng(coordinates)

  const [zoomedMapVisible, setZoomedMapVisible] = useState(false)
  const onHover = (enter) => (e) => {
    e.preventDefault()
    setZoomedMapVisible(enter)
  }

  return (
    <Dropdown>
      <Dropdown.Toggle as={SafeAnchor}>{coordinatesText}</Dropdown.Toggle>
      <Dropdown.Menu className="py-0">
        <ImageStack>
          <Circle />
          <img src={getStaticMapUrl(coordinates, 15)} alt="Location map" />
          <img
            src={getStaticMapUrl(coordinates, 17)}
            className={zoomedMapVisible ? 'visible' : null}
            alt="Location map"
            onMouseEnter={onHover(true)}
            onTouchStart={onHover(true)}
            onMouseLeave={onHover(false)}
            onTouchEnd={onHover(false)}
            onTouchCancel={onHover(false)}
          />
        </ImageStack>
      </Dropdown.Menu>
    </Dropdown>
  )
}

PopupMap.propTypes = {
  coordinates: PropTypes.array.isRequired,
}

export default PopupMap
