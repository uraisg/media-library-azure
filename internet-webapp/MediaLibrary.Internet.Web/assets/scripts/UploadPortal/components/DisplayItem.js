import styled from 'styled-components'
import { useState } from 'react'


const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  height: 20px;
  width: 20px;
`

const Img = styled.img`
  width: 300px;
  height: 250px;

  @media only screen and (max-width: 992px) {
    width: 100%;
  }
`

const Tags = styled.span`
  background-color: green;
  border: 2px solid black;
  border-radius: 4px;
`

export default function DisplayItem(props) {
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
            <table className="table table-borderless table-sm w-75">
              <tbody>
                <tr>
                  <th>Name:</th>
                  <td>{props.item.Name}</td>
                </tr>
                <tr>
                  <th>Location:</th>
                  <td>{props.item.Location}</td>
                </tr>
                <tr>
                  <th>Copyright Owner:</th>
                  <td>{props.item.Copyright}</td>
                </tr>
                <tr>
                  <th>Planning Area:</th>
                  <td>{props.item.PlanningArea}</td>
                </tr>
                <tr>
                  <th>Caption:</th>
                  <td>{props.item.Caption}</td>
                </tr>
                <tr>
                  <th>Tags:</th>
                  <td>{props.item.Tags}</td>
                </tr>
                <tr>
                  <th>Taken on:</th>
                  <td>{props.item.TakenDate}</td>
                </tr>
                <tr>
                  <th>Uploaded on:</th>
                  <td>{props.item.UploadDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
