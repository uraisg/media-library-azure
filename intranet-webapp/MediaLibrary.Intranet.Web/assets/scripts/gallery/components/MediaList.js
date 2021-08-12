import React from 'react'
import styled from 'styled-components'

const ThumbnailLink = styled.a`
  width: 30%;
  min-width: 5rem;
  max-width: 12rem;
  margin-right: 1rem;
`

const Thumbnail = styled.img`
  display: inline-block;
  width: 100%;
  height: auto;
`

const MediaList = ({ results }) => {
  const renderedItems = results.map((result) => {
    return (
      <div key={result.id} className="media p-3 my-3 border rounded bg-light">
        <ThumbnailLink href={result.link}>
          <Thumbnail src={result.thumbnail} alt={result.name} />
        </ThumbnailLink>
        <div className="media-body">
          <h5 className="mt-0">
            <a href={result.link}>{result.name}</a>
          </h5>
          <p className="mb-0">{result.caption}</p>
        </div>
      </div>
    )
  })

  return <div className="media-list">{renderedItems}</div>
}

export default MediaList
