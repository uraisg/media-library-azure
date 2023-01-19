import React, { useState } from 'react'
import PropTypes from 'prop-types'
import Gallery from 'react-grid-gallery'
import { styled } from '@linaria/react'

const Image = styled.img`
width: 100%;
height: 100%
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
`

const AlignRightDiv = styled.div`
display: flex;
justify-content: end;
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
`

const ShowMoreBtn = styled.button`
width: 100%;
text-align: center;
padding: 10px;
background: transparent;
border-width: 0;
color: black;
`

const MediaGrid = ({ results }) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showModal, setShowModal] = useState(false)
  const [tags, setTags] = useState("")

  const onCurrentImageChange = (index) => {
    setCurrentIndex(index)
    setShowModal(true)

    let temTags = "";
    for (let i = 0; i < results[index].tag.length; i++) {
      if (temTags != "") {
        temTags += ","
      }

      temTags += results[index].tag[i]
    }

    setTags(temTags)
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
    <div>
      <Gallery
        images={results}
        onClickThumbnail={(index, event) => onCurrentImageChange(index)}
        enableImageSelection={false}
      />
      {showModal &&
        <Modal>
          <LeftButtonDiv>
            {currentIndex > 0 &&
            <ScrollButton onClick={() => onCurrentImageChange(currentIndex - 1)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-arrowleft" viewBox="0 0 24 24">
              <g clip-path="url(#clip0_429_11254)">
                <path d="M14 7L9 12" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M9 12L14 17" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </g>
            </svg>
          </ScrollButton>
            }
          </LeftButtonDiv>

          <ModalMain>
            <CenterDiv>
                <AlignRightDiv>
                  <CloseButton onClick={() => setShowModal(false)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" className="bi bi-xmark" viewBox="0 0 16 16">
                      <path class="cls-1" d="M13,4.66667,9.66667,7.99917,13,11.33333,11.33333,13,8,9.66667,4.66667,13,3,11.33333,6.33333,7.99917,3,4.66667,4.66667,3,8,6.33333,11.33333,3Z" />
                    </svg>
                  </CloseButton>
                </AlignRightDiv>

                <ImageDiv>
                  <Image src={results[currentIndex].src} alt={results[currentIndex].name} />
                </ImageDiv>

                <AlignRightDiv>
                  <PageCount>{currentIndex+1} of {results.length}</PageCount>
              </AlignRightDiv>
            </CenterDiv>

            <DetailsDiv>
              <InformationDiv>
              <table>
                <tbody>
                  <tr>
                    <td>Name:</td>
                    <td>{results[currentIndex].project}</td>
                  </tr>

                  <tr>
                    <td>Location:</td>
                    <td>{results[currentIndex].area}</td>
                  </tr>

                  <tr>
                    <td>Caption:</td>
                    <td>{results[currentIndex].caption}</td>
                  </tr>

                  <tr>
                    <td>Tags:</td>
                    <td>{tags}</td>
                    </tr>
                  </tbody>
                </table>

                <hr style={{margin:0}}/>

                <ShowMoreBtn key="showDetails" onClick={showDetails} >Show More</ShowMoreBtn>
              </InformationDiv>
            </DetailsDiv>
          </ModalMain>

          <RightButtonDiv>
            {currentIndex < 24 &&
            <ScrollButton onClick={() => onCurrentImageChange(currentIndex + 1)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="currentColor" className="bi bi-arrowright" viewBox="0 0 24 24">
                <g clip-path="url(#clip0_429_11254)">
                <path d="M10 17L15 12" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M15 12L10 7" stroke="#FFFFFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                </g>
              </svg>
            </ScrollButton>
            }
          </RightButtonDiv>
        </Modal>
      }
     </div>
  )
}

MediaGrid.propTypes = {
  results: PropTypes.array,
}

export default MediaGrid
