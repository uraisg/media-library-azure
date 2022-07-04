import React, { useEffect } from 'react';
import styled from 'styled-components'
import { Button } from 'react-bootstrap'
import { X, Plus } from 'react-bootstrap-icons'

import { useFile, useSingleEdit } from '@/components/AllContext'

const Background = styled.div`
  position: fixed;
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 1021;
  cursor: pointer;
`

const Popup = styled.div`
  width: 90%;
  height: auto;
  max-height: 95%;
  background-color: white;
  margin: 2% auto;
  overflow-y: auto;
  padding-bottom: 1%;
  z-index: 1022;
  border-radius: 4px;
`

const Title = styled.span`
  font-weight: bold;
  font-size: 1.2em;
`

const Img = styled.img`
  object-fit: cover;
  height: 400px;
  width: 400px;

  @media only screen and (max-width: 992px) {
    width: 100%;
  }
`



export default function SingleEdit(props) {
  const fileContext = useFile()
  const singleEditContext = useSingleEdit()
  const fileArr = fileContext.retrievedFile[props.index]

  const addNewField = () => {
    const id = Math.random().toString(16).slice(2)
    const temp = [...singleEditContext.newField, {"Id": id, "Key": "", "Value": ""}];
    singleEditContext.setNewField(temp)
  }

  const removeNewField = (e) => {
    const temp = singleEditContext.newField.filter(item => item.Id !== e.target.id)
    singleEditContext.setNewField(temp)
  }


  const off = () => {
    props.setSingleEdit(false)
  }

  return (
    <Background>
      <Popup>
        <div className="pt-2 m-3">
          <Title>{fileArr.Name}</Title>
          <span className="float-right"><X size={30} onClick={off} /></span>
        </div>
        <hr />
        <div className="pt-2 mb-3 container">
          <div className="row">
            <div className="col-12 col-lg-6 col-xl-5">
              <Img src={fileArr.ImageURL} />
            </div>
            <div className="col-12 col-lg-6 col-xl-7">
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Name:<span style={{ color: 'red' }}>*</span></strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" defaultValue={fileArr.Name} className="form-control" /></div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Location:<span style={{ color: 'red' }}>*</span></strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" defaultValue={fileArr.Location} className="form-control" /></div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Copyright Owner:</strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" defaultValue={fileArr.Copyright} className="form-control" /></div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Caption:</strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" defaultValue={fileArr.Caption} className="form-control" /></div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Tags:</strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" defaultValue={fileArr.Tags} className="form-control" /></div>
              </div>
              {singleEditContext.newField.map((item, index) => (
                <div className="newField-div mt-4 row" key={item.Id} id={item.Id}>
                  <div className="d-flex align-items-center col-3 col-lg-4"><input type="text" className={"newField-Key-" + item.Id + " form-control"} />:</div>
                  <div className="d-flex align-items-center col-9 col-lg-8"><input type="text" className={"newField-Value-" + item.Id + " form-control"} /><X size={25} color={'red'} id={item.Id} onClick={removeNewField} /></div>
                </div>
                ))}
              <div className="mt-5">
                <span className="text-danger" onClick={addNewField}><Plus size={30} color={'red'} /> Add new Field</span>
                <div className="float-right">
                  <Button variant="secondary">Reset</Button>{' '}
                  <Button variant="primary">Save</Button>{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Background>
  )
}
