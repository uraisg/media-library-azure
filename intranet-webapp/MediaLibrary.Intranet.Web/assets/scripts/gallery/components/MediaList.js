import React from 'react'
import PropTypes from 'prop-types'
import { styled } from '@linaria/react'

import { formatShortDate } from '@/../format'

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
      <div key={result.id}>
        <hr />
        <div className="media p-3 my-3">
          <ThumbnailLink href={result.link}>
            <Thumbnail src={result.src} alt={result.name} />
          </ThumbnailLink>
          <div className="d-flex w-100 media-body">
            {/*left div*/}
            <div className="w-50">
              <h5 className="mt-0">
                <a className="listview-text text-decoration-none text-dark" href={result.link}>{result.project}</a>
              </h5>
              <p className="mb-0">{result.caption}<br />{result.area}</p>
            </div>
            {/*right div*/}
            <div className="text-right w-50">
              Uploaded {formatShortDate(result.uploadDate)}<br />{result.author}
            </div>
          </div>
        </div>
      </div>
    )
  })

  return <div className="media-list">{renderedItems}</div>
}

MediaList.propTypes = {
  results: PropTypes.array,
}

export default MediaList
