import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { Gallery } from 'react-grid-gallery'
import { styled } from '@linaria/react'
import DelayedSpinner from '@/components/DelayedSpinner'

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

const Modal = styled.div`
  position: fixed;
  display: flex;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  z-index: 10000;
`

const ModalMain = styled.div`
  display: flex;
  justify-content: center;
  margin: auto;
  height: 90%;
  width: 100%;
  pointer-events: none;
`

const LeftButtonDiv = styled.div`
  margin: auto;
`

const CenterDiv = styled.div`
  display: flex;
  flex-flow: column wrap;
  height: 100%;
  width: auto;
`

const RightButtonDiv = styled.div`
  margin: auto;
`

const ScrollButton = styled.button`
  background: transparent;
  border-width: 0;
  color: white;
`

const CloseButton = styled.button`
  background: transparent;
  border-width: 0;
  color: white;
`

const ImageDiv = styled.div`
  height: 80%;
  width: 100%;
  pointer-events: auto;
`

const AlignRightDiv = styled.div`
  display: flex;
  justify-content: flex-end;
  pointer-events: auto;
`

const PageCount = styled.p`
  color: white;
`

const DetailsDiv = styled.div`
  display: flex;
  flex-flow: column wrap;
  margin-left: 20px;
`

const InformationDiv = styled.div`
  border-style: solid;
  border-width: 1px;
  background: white;
  pointer-events: auto;
`

const ShowMoreBtn = styled.button`
  width: 100%;
  text-align: center;
  padding: 10px;
  background: transparent;
  border-width: 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  color: black;
`

const TD1 = styled.td`
  width: 8vw;
  display: inline-block;
  padding-left: 10px;
  padding-right: 10px;
  word-wrap: break-word;
  font-weight: bold;
`

const TD2 = styled.td`
  width: 16vw;
  display: inline-block;
  padding-left: 10px;
  padding-right: 10px;
  word-wrap: break-word;
`

const THUMBNAIL_WIDTH = 320
const THUMBNAIL_HEIGHT = 240

const MediaGrid = ({ results }) => {
  const [loaded, setLoad] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [showModal, setShowModal] = useState(false)

  const openLightbox = (index) => {
    // Ensure array index is within bounds
    index = Math.min(Math.max(0, index), results.length - 1)

    if (index != currentIndex) {
      setLoad(false)
      setCurrentIndex(index)
      setShowModal(true)
    }
  }

  const closeLightbox = () => {
    setShowModal(false)
    setCurrentIndex(-1)
  }

  const showDetails = () => {
    document.location = currentImage.link
  }

  // Handle user keyboard navigation in lightbox
  const handleKeyDown = useCallback(
    (event) => {
      if (showModal) {
        switch (event.key) {
          case 'Escape':
            closeLightbox()
            break
          case 'ArrowLeft':
            openLightbox(currentIndex - 1)
            break
          case 'ArrowRight':
            openLightbox(currentIndex + 1)
            break
          default:
            return
        }

        event.preventDefault()
      }
    },
    [currentIndex, showModal]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Handle user clicking in modal backdrop
  const handleModalClick = useCallback((event) => {
    if (event.target === event.currentTarget) {
      closeLightbox()
    }
  }, [])

  // Set grid thumbnail sizes
  results = results.map((result) => {
    return {
      ...result,
      width: THUMBNAIL_WIDTH,
      height: THUMBNAIL_HEIGHT,
    }
  })

  const currentImage = currentIndex >= 0 ? results[currentIndex] : null
  const tags = currentImage?.tag.join(', ')

  return (
    <div>
      <Gallery
        images={results}
        onClick={(index, event) => openLightbox(index)}
        enableImageSelection={false}
      />
      {showModal && (
        <Modal onClick={handleModalClick}>
          <LeftButtonDiv>
            {currentIndex > 0 && (
              <ScrollButton onClick={() => openLightbox(currentIndex - 1)}>
                {/* prettier-ignore */}
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-arrowleft" viewBox="0 0 24 24">
                  <g clipPath="url(#clip0_429_11254)">
                    <path d="M14 7L9 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 12L14 17" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </ScrollButton>
            )}
          </LeftButtonDiv>

          <ModalMain>
            <CenterDiv>
              <AlignRightDiv>
                <CloseButton onClick={() => closeLightbox()}>
                  {/* prettier-ignore */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-xmark" viewBox="0 0 16 16">
                    <path d="M13,4.66667,9.66667,7.99917,13,11.33333,11.33333,13,8,9.66667,4.66667,13,3,11.33333,6.33333,7.99917,3,4.66667,4.66667,3,8,6.33333,11.33333,3Z" />
                  </svg>
                </CloseButton>
              </AlignRightDiv>

              <ImageDiv>
                {!loaded && <DelayedSpinner />}
                <Image
                  src={currentImage.original}
                  alt={currentImage.name}
                  onLoad={() => setLoad(true)}
                  style={loaded ? {} : { display: 'none' }}
                />
              </ImageDiv>

              <AlignRightDiv>
                <PageCount>
                  {currentIndex + 1} of {results.length}
                </PageCount>
              </AlignRightDiv>
            </CenterDiv>

            <DetailsDiv>
              <InformationDiv>
                <table>
                  <tbody>
                    <tr>
                      <TD1>Name</TD1>
                      <TD2>{currentImage.project}</TD2>
                    </tr>
                    <tr>
                      <TD1>Location</TD1>
                      <TD2>{currentImage.area}</TD2>
                    </tr>
                    <tr>
                      <TD1>Caption</TD1>
                      <TD2>{currentImage.caption}</TD2>
                    </tr>
                    <tr>
                      <TD1>Tags</TD1>
                      <TD2>{tags}</TD2>
                    </tr>
                  </tbody>
                </table>

                <ShowMoreBtn key="showDetails" onClick={showDetails}>
                  Show More
                </ShowMoreBtn>
              </InformationDiv>
            </DetailsDiv>
          </ModalMain>

          <RightButtonDiv>
            {currentIndex < results.length - 1 && (
              <ScrollButton onClick={() => openLightbox(currentIndex + 1)}>
                {/* prettier-ignore */}
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-arrowright" viewBox="0 0 24 24">
                  <g clipPath="url(#clip0_429_11254)">
                    <path d="M10 17L15 12" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12L10 7" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </g>
                </svg>
              </ScrollButton>
            )}
          </RightButtonDiv>
        </Modal>
      )}
    </div>
  )
}

MediaGrid.propTypes = {
  results: PropTypes.array,
}

export default MediaGrid
