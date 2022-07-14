import styled from 'styled-components'


const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  height: 20px;
  width: 20px;
`

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

export default function DisplayItem(props) {
  const uploadTags = props.item.Tags.split(",")
  return (
    <div className='align-items-center d-flex'>
      {props.update &&
        <Checkbox onClick={props.setCheckValue} id={props.Key + "ChkBox"} className="item-chkbox" />
      }
      <div className="container item-list pt-4" id={props.Key + "Div"}>
        <div className="row">
          <div className="col-12 col-lg-5 col-xl-4">
            <Img src={props.item.ImageURL} />
          </div>
          <div className="col-12 col-lg-7 col-xl-8">
            <div className="container">
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Name:</strong>
                </div>
                <div className="col-8">
                  {props.item.Name}
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Location:</strong>
                </div>
                <div className="col-8">
                  {props.item.Location}
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
                  <strong>Planning Area:</strong>
                </div>
                <div className="col-8">
                  {props.item.PlanningArea}
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
                    <span className="text-break">{props.item.Tags}</span>
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
                  {props.item.TakenDate}
                </div>
              </div>
              <div className="py-1 row">
                <div className="col-4">
                  <strong>Uploaded on:</strong>
                </div>
                <div className="col-8">
                  {props.item.UploadDate}
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
