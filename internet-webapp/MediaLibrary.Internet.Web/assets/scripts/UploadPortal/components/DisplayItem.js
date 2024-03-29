import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@linaria/react'
import { format } from 'date-fns'

import PopupMap from '@/components/PopupMap'

const DATE_FORMAT = 'd MMM yyyy h:mm a'
function formatDate(date) {
  return format(new Date(date), DATE_FORMAT)
}

const Checkbox = styled.input`
  height: 20px;
  width: 20px;
`
Checkbox.defaultProps = { type: 'checkbox' }

const Img = styled.img`
  object-fit: cover;
  max-width: 330px;
  min-width: 250px;
  min-height: 250px;
  max-height: 400px;

  @media only screen and (max-width: 992px) {
    max-width: 100%;
  }
`

const Tags = styled.span`
  border: 1px solid #6c757d;
  border-radius: 0.25em;
  padding: 0.25em;
  font-size: 13px;
  margin-right: 0.25em;
`

const DisplayItem = (props) => {
  const [curimageURL, setCurImageURL] = useState('')

  const uploadTags = props.item.Tag.split(',')

  useEffect(() => {
    fetch('api/convert', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
      },
      body: JSON.stringify({ Name: props.item.FileURL, RowKey: props.draftKey, Thumbnail: true })
    })
      .then((res) => res.json())
      .then((res) => setCurImageURL(res));
  }, [])

  return (
    <div className='align-items-center d-flex'>
      {props.update &&
        <Checkbox onClick={props.setCheckValue} id={props.Key + "ChkBox"} className="item-chkbox" />
      }
      <div className="container item-list pt-4 pb-4" id={props.Key + "Div"}>
        <div className="row">
          <div className="col-12 col-lg-5 col-xl-4">
            <Img src={curimageURL} />
          </div>
          <div className="col-12 col-lg-7 col-xl-8">
            <div className="container">
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Name:</strong>
                </div>
                <div className="col-8">
                  {props.item.Project}
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Location:</strong>
                </div>

                <div className="col-8">
                  {props.item.LocationName}
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Copyright Owner:</strong>
                </div>
                <div className="col-8">
                  {props.item.Copyright}
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Caption:</strong>
                </div>
                <div className="col-8">
                  {props.item.Caption}
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Tags:</strong>
                </div>
                <div className="col-8">
                    {props.update
                      ?
                    <span className="text-break">{props.item.Tag}</span>
                    :
                    <div className="row ml-1">
                      {uploadTags.map((item, index) => (
                        <Tags key={index}>{item.trim()}</Tags>
                      ))}
                    </div>
                    }
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Geotag:</strong>
                </div>
                <div className="col-8">
                  {props.item.Location !== 'null' ? (
                    <PopupMap
                      coordinates={JSON.parse(props.item.Location).coordinates}
                    />
                  ) : (
                    'No geotag'
                  )}
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Taken on:</strong>
                </div>
                <div className="col-8">
                  {formatDate(props.item.DateTaken)}
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Uploaded on:</strong>
                </div>
                <div className="col-8">
                  {formatDate(props.item.UploadDate)}
                </div>
              </div>
              {props.item.AdditionalField.map((item) => (
                <div className="py-1 row" key={item.Id}>
                  <div className="col-4">
                    <strong>{item.Key}:</strong>
                  </div>
                    <div className="col-8">
                      {item.Value}
                    </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

DisplayItem.propTypes = {
  item: PropTypes.object,
  Key: PropTypes.string,
  update: PropTypes.bool,
  draftKey: PropTypes.string,
}

export default DisplayItem
