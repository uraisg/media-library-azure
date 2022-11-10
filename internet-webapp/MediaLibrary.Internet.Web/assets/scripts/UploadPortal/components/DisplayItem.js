import React, { useState, useEffect } from 'react';
import { styled } from '@linaria/react';
import PropTypes from 'prop-types';
import { format } from 'date-fns';


const DATE_FORMAT = 'd MMM yyyy h:mm a'
function formatDate(date) {
  return format(new Date(date), DATE_FORMAT);
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

const Circle = styled.span`
  position: absolute;
  border: 2px solid #666;
  border-radius: 0.5em;
  padding: 0.25em;
  margin: 80% 0 0 80%;
  background: #fff;
  z-index: 100;
`


const DisplayItem = (props) => {
  const [curimageURL, setCurImageURL] = useState("");
  const [opaque, setOpaque] = useState(1);
  const [img1, setImg1] = useState("");
  const [img2, setImg2] = useState("");
  const [coords, setCoords] = useState("");
  const [refresh, setRefresh] = useState(true);
  const [nullLocation, setNullLocation] = useState(false);
  const [img1CSS, setImg1CSS] = useState("");
  const [img2CSS, setImg2CSS] = useState("");

  const uploadTags = props.item.Tag.split(",");

  useEffect(() => {
    fetch(`/api/convert`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
      },
      body: JSON.stringify({ Name: props.item.FileURL })
    })
      .then((res) => res.json())
      .then((res) => setCurImageURL(res));
  }, [])

  function getStaticMapUrl(coords, zoom) {
    const decimalPlaces = 5
    const lat = coords[1].toFixed(decimalPlaces)
    const lng = coords[0].toFixed(decimalPlaces)
    return (
      'https://developers.onemap.sg/commonapi/staticmap/getStaticImage?layerchosen=default&' +
      `lat=${lat}&lng=${lng}&zoom=${zoom}&height=256&width=256`
    )
  }

  function getCoords() {
    if (props.item.Location != "null") {
      setRefresh(false);
      setNullLocation(true);

      const coordinates = JSON.parse(props.item.Location).coordinates;
      let coordsText = "";
      for (let i of coordinates) {
        if (coordsText != "") {
          coordsText += ", "
        }
        coordsText += parseFloat(i).toFixed(5)
      }

      setCoords(coordsText);
      setImg1(getStaticMapUrl(coordinates, 15));
      setImg2(getStaticMapUrl(coordinates, 17));
    }
  }

  useEffect(() => {
    if (refresh) {
      getCoords()

      setImg1CSS({
        opacity: 1,
        transition: "all 0.5s ease-out",
        position: "absolute"
      })

      setImg2CSS({
        opacity: 0,
        transition: "all 0.5s ease-out",
        position: "absolute"
      })
    }
  }, [refresh])

  useEffect(() => {
    if (opaque == 1) {
      setImg1CSS({
        opacity: 1,
        transition: "all 0.5s ease-out",
        position: "absolute"
      })
      setImg2CSS({
        opacity: 0,
        transition: "all 0.5s ease-out",
        position: "absolute"
      })
    }
    else {
      setImg1CSS({
        opacity: 0,
        transition: "all 0.5s ease-out",
        position: "absolute"
      })
      setImg2CSS({
        opacity: 1,
        transition: "all 0.5s ease-out",
        position: "absolute"
      })
    }
  }, [opaque])

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

                { nullLocation ?
                  <div className="col-8">
                    <span className="dropdown">
                      <a className="dropdown-toggle" role="button" id="metadata-geo-dropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">{coords}</a>
                      <div className="dropdown-menu py-0" aria-labelledby="metadata-geo-dropdown">
                        <div className="image-stack" onMouseEnter={() => setOpaque(2)} onMouseLeave={() => setOpaque(1)}>
                          <Circle></Circle>
                          <img src={img1} alt="Location map" style={img1CSS}/>
                          <img src={img2} alt="Location map" style={img2CSS} />
                        </div>
                      </div>
                    </span>
                  </div>
                  :
                  <div className="col-8">
                    {props.item.Location}
                  </div>
                }

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
                  <strong>Planning Area:</strong>
                </div>
                <div className="col-8">
                  {props.item.LocationName}
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
  update: PropTypes.bool
}

export default DisplayItem
