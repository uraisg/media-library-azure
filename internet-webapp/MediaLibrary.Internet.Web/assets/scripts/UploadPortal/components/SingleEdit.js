import React, { useState, useEffect } from 'react';
import styled from 'styled-components'
import { Button } from 'react-bootstrap'
import { X, Plus } from 'react-bootstrap-icons'

import { useForm } from '@/components/AllContext'

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
  const fileContext = useForm()

  const fileArr = fileContext.retrievedFile.filter(item => item.Id == props.index[0])[0]
  const [newDetails, setNewDetails] = useState(fileArr)
  const [newField, setNewField] = useState([])
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState({Name: false, Location: false})

  useEffect(() => {
    fileArr.AdditionalField.map((item) => {
      const id = Math.random().toString(16).slice(2)
      setNewField(field => [...field, { "Id": id, "Key": item.Key, "Value": item.Value }])
    })
  }, [])

  const addNewField = () => {
    const id = Math.random().toString(16).slice(2)
    const temp = [...newField, {"Id": id, "Key": "", "Value": ""}];
    setNewField(temp)
  }

  const removeNewField = (e) => {
    const temp = newField.filter(item => item.Id !== e.target.id)
    setNewField(temp)
  }

  const updateField = (e) => {
    setNewDetails(item => ({ ...item, [e.target.id]: e.target.value }))
  }

  const updateKeyField = (e) => {
    const temp = newField.map((item) => {
      if (item.Id === e.target.dataset.keyid) {
        return { ...item, Key: e.target.value }
      }
      return item
    })

    setNewField(temp)
  }

  const updateValueField = (e) => {
    const temp = newField.map((item) => {
      if (item.Id === e.target.dataset.keyid) {
        return { ...item, Value: e.target.value }
      }
      return item
    })

    setNewField(temp)
  }

  const checkValidField = () => {
    let err = false
    if (newDetails.Name === "") {
      setErrMsg(item => ({ ...item, Name: true }))
      err = true
    }
    else {
      setErrMsg(item => ({ ...item, Name: false }))
    }

    if (newDetails.Location === "") {
      setErrMsg(item => ({ ...item, Location: true }))
      err = true
    }
    else {
      setErrMsg(item => ({ ...item, Location: false }))
    }

    if (err) {
      return false
    }
    else {
      setErrMsg({ Name: false, Location: false })
      return true
    }
  }

  const checkValidAddField = () => {
    let err = false

    newField.map((item) => {
      let itemErr = false
      if (!item.Value) {
        $(`#errMsg-addField-${item.Id}`).html("The value field is required.")
        itemErr = true
        err = true
      }
      if (!item.Key) {
        $(`#errMsg-addField-${item.Id}`).html("The key field is required.")
        itemErr = true
        err = true
      }

      if (!itemErr) {
        $(`#errMsg-addField-${item.Id}`).html("")
      }
    })

    if (err) {
      return false
    }
    else {
      return true
    }
  }

  const save = () => {
    if (!checkValidField() || !checkValidAddField()) {
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      props.renderRefresh()
      off()
    }, 2000)
  }

  const reset = () => {
    setNewDetails(fileArr)
    setNewField([])
    fileArr.AdditionalField.map((item) => {
      const id = Math.random().toString(16).slice(2)
      setNewField(field => [...field, { "Id": id, "Key": item.Key, "Value": item.Value }])
    })
  }

  const off = () => {
    setNewField([])
    props.setSingleEdit(false)
  }

  return (
    <Background>
      <Popup>
        <div className="pt-2 m-3">
          <Title>{fileArr.Name}</Title>
          <span className="pointer-cursor float-right"><X size={30} color={'grey'} onClick={off} /></span>
        </div>
        <hr />
        <div className="pt-2 mb-3 container">
          <div className="row">
            <div className="col-12 col-lg-6 col-xl-5">
              <Img src={fileArr.ImageURL} />
            </div>
            <div className="col-12 col-lg-6 col-xl-7">
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Name:<span className="text-danger">*</span></strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10">
                  <input type="text" value={newDetails.Name} id="Name" onChange={updateField} className="form-control" />
                  {errMsg.Name &&
                    <span className="text-danger">The Name Field is required</span>
                  }
                </div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Location:<span className="text-danger">*</span></strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10">
                  <input type="text" value={newDetails.Location} onChange={updateField} id="Location" className="form-control" />
                  {errMsg.Location &&
                    <span className="text-danger">The Location Field is required</span>
                  }
                </div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Copyright Owner:</strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" value={newDetails.Copyright} onChange={updateField} id="Copyright" className="form-control" /></div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Caption:</strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" value={newDetails.Caption} onChange={updateField} id="Caption" className="form-control" /></div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Tags:</strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" value={newDetails.Tags} onChange={updateField} id="Tags" className="form-control" /><small className="text-secondary">Tags are separated with a comma</small></div>
              </div>

              {newField.length > 0 &&
                <div className="mt-4 row">
                <div className="col-3 col-lg-5 text-center"><strong className="mr-2">Key</strong></div>
                <div className="col-9 col-lg-7 text-center"><strong className="ml-2 mr-5">Value</strong></div>
                </div>
              }
              {newField.map((item) => (
                <div className="newField-div mt-2 row" key={item.Id} id={item.Id}>
                  <div className="d-flex align-items-center col-3 col-lg-5"><input type="text" value={item.Key} onChange={updateKeyField} data-keyid={item.Id} className="form-control" placeholder="Enter key here" />:</div>
                  <div className="d-flex align-items-center col-9 col-lg-7"><input type="text" value={item.Value} data-keyid={item.Id} onChange={updateValueField} className={"newField-Value-" + item.Id + " form-control"} placeholder="Enter value here" /><X className="user-select-none pointer-cursor" size={25} color={'red'} id={item.Id} onClick={removeNewField} /></div>
                  <span id={"errMsg-addField-" + item.Id} className="ml-3 mt-1 text-danger"></span>
                </div>
              ))}
              {newField.length > 0 &&
                <small className="text-secondary">Key field is required to identify additional information (e.g. Details, Comments, Team, etc.)</small>
              }

              <div className="mt-3">
                <span className="user-select-none pointer-cursor text-danger" onClick={addNewField}><Plus size={30} color={'red'} /> Add new Field</span>
                <div className="float-right">
                  <Button variant="secondary" onClick={reset} disabled={loading}>Reset</Button>{' '}
                  <Button variant="primary" onClick={save} disabled={loading}>Save</Button>{' '}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Popup>
    </Background>
  )
}
