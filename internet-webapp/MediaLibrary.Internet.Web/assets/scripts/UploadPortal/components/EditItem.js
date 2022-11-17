import React, { useState, useEffect } from 'react';
import { styled } from '@linaria/react'
import { Button } from 'react-bootstrap'
import { X, Plus } from 'react-bootstrap-icons'
import PropTypes from 'prop-types'

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

const Sidebar = styled.div`
  z-index: 1022;
  width: 450px;
  height: 100%;
  top: 0;
  right:0;
  position: fixed;
  background-color: white;
  transition: width 2s;
`

const ButtonArea = styled.div`
  bottom: 1em;
  width: 92%;
  position: absolute;
`


const SingleEdit = (props) => {
  const fileContext = useForm()

  const fileArr = fileContext.retrievedFile.filter(item => item.Id == props.index[0])[0]
  const [newDetails, setNewDetails] = useState(fileArr)
  const [newField, setNewField] = useState([])
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState({ Name: false, Project: false })
  const [curimageURL, setCurImageURL] = useState("");

  useEffect(() => {
    fetch('api/convert', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
      },
      body: JSON.stringify({ Name: fileArr.FileURL, RowKey: props.draftKey })
    })
      .then((res) => res.json())
      .then((res) => setCurImageURL(res));
  }, [])

  useEffect(() => {
    fileArr.AdditionalField.map((item) => {
      const id = Math.random().toString(16).slice(2)
      setNewField(field => [...field, { "Id": id, "Key": item.Key, "Value": item.Value }])
    })
  }, [])

  const addNewField = () => {
    const id = Math.random().toString(16).slice(2)
    const temp = [...newField, { "Id": id, "Key": "", "Value": "" }];
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
    if (newDetails.Project === "") {
      setErrMsg(item => ({ ...item, Project: true }))
      err = true
    }
    else {
      setErrMsg(item => ({ ...item, Project: false }))
    }

    if (newDetails.LocationName === "") {
      setErrMsg(item => ({ ...item, LocationName: true }))
      err = true
    }
    else {
      setErrMsg(item => ({ ...item, LocationName: false }))
    }

    if (err) {
      return false
    }
    else {
      setErrMsg({ Project: false, LocationName: false })
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
    props.setErrMsg1(false);

    if (!checkValidField() || !checkValidAddField()) {
      props.setErrMsg1Text("Fields cannot be empty");
      props.setErrMsg1(true);
      return;
    }

    setLoading(true)

    let newAdditionalField = []
    for (let field in newField) {
      newAdditionalField.push(newField[field])
    }

    setNewDetails(newAdditionalField)

    let bodyDetails = newDetails
    bodyDetails.AdditionalField = newAdditionalField

    fetch(`draft/${props.draftKey}/${fileArr.Id}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
      },
      body: JSON.stringify(bodyDetails)
    })
      .then((response) => response.json())
      .then((response) => {
        setLoading(false)

        if (!response.success) {
          props.setErrMsg1Text(response.errorMessage);
          props.setErrMsg1(true);
          return;
        }

        props.renderRefresh()
        off()
      })
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
    props.setEditItem(false)
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
              <Img src={curimageURL} />
            </div>
            <div className="col-12 col-lg-6 col-xl-7">
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Name:<span className="text-danger">*</span></strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10">
                  <input type="text" value={newDetails.Project} id="Project" onChange={updateField} className="form-control" />
                  {errMsg.Project &&
                    <span className="text-danger">The Name Field is required</span>
                  }
                </div>
              </div>
              <div className="mt-2 row">
                <div className="mt-2 col-12 col-md-2 col-lg-3 col-xl-2"><strong>Location:<span className="text-danger">*</span></strong></div>
                <div className="col-12 col-md-10 col-lg-9 col-xl-10">
                  <input type="text" value={newDetails.LocationName} onChange={updateField} id="LocationName" className="form-control" />
                  {errMsg.LocationName &&
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
                <div className="col-12 col-md-10 col-lg-9 col-xl-10"><input type="text" value={newDetails.Tag} onChange={updateField} id="Tag" className="form-control" /><small className="text-secondary">Tags are separated with a comma</small></div>
              </div>

              {newField.length > 0 &&
                <div className="mt-4 row">
                  <div className="col-3 col-lg-5 text-center"><strong className="mr-2">Label Name</strong></div>
                  <div className="col-9 col-lg-7 text-center"><strong className="ml-2 mr-5">Value</strong></div>
                </div>
              }
              {newField.map((item) => (
                <div className="newField-div mt-2 row" key={item.Id} id={item.Id}>
                  <div className="d-flex align-items-center col-3 col-lg-5"><input type="text" value={item.Key} onChange={updateKeyField} data-keyid={item.Id} className="form-control" placeholder="Enter label name here" />:</div>
                  <div className="d-flex align-items-center col-9 col-lg-7"><input type="text" value={item.Value} data-keyid={item.Id} onChange={updateValueField} className={"newField-Value-" + item.Id + " form-control"} placeholder="Enter value here" /><X className="user-select-none pointer-cursor" size={25} color={'red'} id={item.Id} onClick={removeNewField} /></div>
                  <span id={"errMsg-addField-" + item.Id} className="ml-3 mt-1 text-danger"></span>
                </div>
              ))}
              {newField.length > 0 &&
                <small className="text-secondary">Label name field is required to identify additional information (e.g. Details, Comments, Team, etc.)</small>
              }

              {props.errMsg1 &&
                <p className="text-danger">{props.errMsg1Text}</p>
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

const BatchEdit = (props) => {
  const formContext = useForm()
  const [newField, setNewField] = useState(checkAddField())
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState({ Name: false, Project: false })

  const [defaultValue, setDefaultValue] = useState({ Project: "", LocationName: "", Copyright: "", Caption: "", Tags: "" })
  const [option, setOption] = useState({ Project: "nil", LocationName: "nil", Copyright: "nil", Caption: "nil", Tags: "nil" })
  const updateOption = [{ Value: "nil", Option: "No change" }, { Value: "begin", Option: "Insert at beginning" }, { Value: "end", Option: "Insert at end" }, { Value: "all", Option: "Replace all" }]
  const updateTagsOptions = [{ Value: "nil", Option: "No change" }, { Value: "end", Option: "Add" }, { Value: "all", Option: "Replace all" }]

  const handleOption = (e) => {
    setOption(item => ({ ...item, [e.target.id.replace("-select", "")]: e.target.value }))
  }

  function checkAddField() {
    let arr = []
    const fileArr = formContext.retrievedFile.filter(item => props.index.includes(item.Id))
    const first_obj = fileArr[0]
    first_obj.AdditionalField.map((item) => {
      const key = item.Key
      const value = item.Value

      const commonField = checkAllField(key, value, fileArr)
      if (commonField) {
        arr.push(commonField)
      }

      return item
    })
    return arr
  }

  function checkAllField(key, value, fileArr) {
    let allId = []
    let valueCheck = false
    fileArr.map((item) => {
      item.AdditionalField.map((item2) => {
        if (item2.Key === key) {
          allId.push(item2.Id)
          if (item2.Value === value) {
            valueCheck = true
          }
          else {
            valueCheck = false
          }
        }
      })
    })

    if (allId.length === fileArr.length) {
      if (!valueCheck) {
        value = ""
      }
      const tempId = Math.random().toString(16).slice(2)
      return { Id: tempId, allId: allId, Key: key, Value: value }
    }
  }

  const updateField = (e) => {
    setDefaultValue(item => ({ ...item, [e.target.id]: e.target.value }))
  }

  const addNewField = () => {
    const id = Math.random().toString(16).slice(2)
    setNewField(item => [...item, { Id: id, allId: [], Key: "", Value: "" }])
  }

  const removeNewField = (e) => {
    const temp = newField.filter(item => item.Id !== e.target.id)
    setNewField(temp)
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

  const reset = () => {
    setDefaultValue({ Project: "", LocationName: "", Copyright: "", Caption: "", Tags: "" })
    setOption({ Project: "nil", LocationName: "nil", Copyright: "nil", Caption: "nil", Tags: "nil" })
    $(".update-option").val("nil")
    setNewField(checkAddField())
  }

  const checkValidField = () => {
    let err = false

    if (option.Name !== "nil" && defaultValue.Name === "") {
      setErrMsg(item => ({ ...item, Project: true }))
      err = true
    } else {
      setErrMsg(item => ({ ...item, Project: false }))
    }
    if (option.Project !== "nil" && defaultValue.Project === "") {
      setErrMsg(item => ({ ...item, LocationName: true }))
      err = true
    } else {
      setErrMsg(item => ({ ...item, LocationName: false }))
    }

    if (err) {
      return false
    }
    else {
      setErrMsg({ Project: false, LocationName: false })
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

  const save = async() => {
    if (!checkValidField() || !checkValidAddField()) {
      return
    }

    setLoading(true)

    // Get Original Values
    let response = await fetch(`draft/${props.draftKey}`);
    let responseJSON = await response.json();

    if (!responseJSON.success) {
      props.setErrMsg1Text(responseJSON.errorMessage);
      props.setErrMsg1(true);
      setLoading(false);
      return;
    }

    let imageEntities = JSON.parse(responseJSON.result["imageEntities"]);

    for await (let imageId of props.index) {
      for await (let imageEntity of imageEntities) {
        if (imageEntity["Id"] == imageId) {
          // Update Name
          if (option["Project"] != "nil") {
            if (option["Project"] == "begin") {
              imageEntity["Project"] = defaultValue["Project"] + imageEntity["Project"]
            }
            else if (option["Project"] == "end") {
              imageEntity["Project"] = imageEntity["Project"] + defaultValue["Project"]
            }
            else {
              imageEntity["Project"] = defaultValue["Project"]
            }
          }

          // Update Project
          if (option["LocationName"] != "nil") {
            if (option["LocationName"] == "begin") {
              imageEntity["LocationName"] = defaultValue["LocationName"] + imageEntity["LocationName"]
            }
            else if (option["LocationName"] == "end") {
              imageEntity["LocationName"] = imageEntity["LocationName"] + defaultValue["LocationName"]
            }
            else {
              imageEntity["LocationName"] = defaultValue["LocationName"]
            }
          }

          // Update Copyright
          if (option["Copyright"] != "nil") {
            if (option["Copyright"] == "begin") {
              imageEntity["Copyright"] = defaultValue["Copyright"] + imageEntity["Copyright"]
            }
            else if (option["Copyright"] == "end") {
              imageEntity["Copyright"] = imageEntity["Copyright"] + defaultValue["Copyright"]
            }
            else {
              imageEntity["Copyright"] = defaultValue["Copyright"]
            }
          }

          // Update Caption
          if (option["Caption"] != "nil") {
            if (option["Caption"] == "begin") {
              imageEntity["Caption"] = defaultValue["Caption"] + imageEntity["Caption"]
            }
            else if (option["Caption"] == "end") {
              imageEntity["Caption"] = imageEntity["Caption"] + defaultValue["Caption"]
            }
            else {
              imageEntity["Caption"] = defaultValue["Caption"]
            }
          }

          // Update Tags
          if (option["Tags"] != "nil") {
            if (option["Tags"] == "end") {
              imageEntity["Tag"] = imageEntity["Tag"] + "," + defaultValue["Tags"]
            }
            else {
              imageEntity["Tag"] = defaultValue["Tags"]
            }
          }

          imageEntity["AdditionalField"] = []
          for await (let field of newField) {
            delete field["allId"];
            imageEntity["AdditionalField"].push(field);
          }

          const response = await fetch(`draft/${props.draftKey}/${imageId}`, {
            method: 'PUT',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
            },
            body: JSON.stringify(imageEntity)
          })

          const responseData = await response.json();

          if (!responseData.success) {
            props.setErrMsg1Text(responseData.errorMessage);
            props.setErrMsg1(true);
            setLoading(false);
            return;
          }

          break
        }
      }
    }

    setLoading(false)
    props.renderRefresh()
    off()
  }

  const off = () => {
    setNewField([])
    props.setEditItem(false)
  }

  return (
    <Background>
      <Sidebar className="shadow">
        <div className="mt-4 ml-3 mr-2">
          <Title>Edit Details</Title>
          <X size={35} color={'grey'} className="pointer-cursor float-right" onClick={off} />
        </div>

        <div className="mt-4 container text-secondary" style={{ fontSize: '14px' }}>
          <label htmlFor="Note">Note:</label>
          <ul>
            <li>Edits will be made only to selected uploads</li>
            <li>Additional fields will be appended and not overwritten</li>
          </ul>
        </div>

        <div className="mt-5 container">
          <div className="row">
            <div className="mt-1 col-3"><strong>Name:<span className="text-danger">*</span></strong></div>
            <div className="col-9">
              <select className="update-option form-control" defaultValue="nil" id="Project-select" onChange={handleOption}>
                {updateOption.map((item, index) => (
                  <option key={index} value={item.Value}>{item.Option}</option>
                ))}
              </select>
            </div>
          </div>

          {option.Project !== "nil" &&
            <>
            <input type="text" className="mt-2 form-control" id="Project" value={defaultValue.Project} onChange={updateField} placeholder="Edit name here" />
            {errMsg.Project &&
                <span className="text-danger">The Name field is required.</span>
              }
            </>
          }

          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Location:<span className="text-danger">*</span></strong></div>
            <div className="col-9">
              <select className="update-option form-control" defaultValue="nil" id="LocationName-select" onChange={handleOption}>
                {updateOption.map((item, index) => (
                  <option key={index} value={item.Value}>{item.Option}</option>
                ))}
              </select>
            </div>
          </div>

          {option.LocationName !== "nil" &&
            <>
            <input type="text" className="mt-2 form-control" id="LocationName" value={defaultValue.LocationName} onChange={updateField} placeholder="Edit location here" />
            {errMsg.LocationName &&
                <span className="text-danger">The Location field is required.</span>
              }
            </>
          }

          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Copyright:</strong></div>
            <div className="col-9">
              <select className="update-option form-control" defaultValue="nil" id="Copyright-select" onChange={handleOption}>
                {updateOption.map((item, index) => (
                  <option key={index} value={item.Value}>{item.Option}</option>
                ))}
              </select>
            </div>
          </div>

          {option.Copyright !== "nil" &&
            <input type="text" className="mt-2 form-control" id="Copyright" value={defaultValue.Copyright} onChange={updateField} placeholder="Edit copyright here" />
          }

          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Caption:</strong></div>
            <div className="col-9">
              <select className="update-option form-control" defaultValue="nil" id="Caption-select" onChange={handleOption}>
                {updateOption.map((item, index) => (
                  <option key={index} value={item.Value}>{item.Option}</option>
                ))}
              </select>
            </div>
          </div>

          {option.Caption !== "nil" &&
            <input type="text" className="mt-2 form-control" id="Caption" value={defaultValue.Caption} onChange={updateField} placeholder="Edit caption here" />
          }

          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Tags:</strong></div>
            <div className="col-9">
              <select className="update-option form-control" defaultValue="nil" id="Tags-select" onChange={handleOption}>
                {updateTagsOptions.map((item, index) => (
                  <option key={index} value={item.Value}>{item.Option}</option>
                ))}
              </select>
            </div>
          </div>

          {option.Tags !== "nil" &&
            <>
              <input type="text" className="mt-2 form-control" id="Tags" value={defaultValue.Tags} onChange={updateField} placeholder="Edit tags here" />
              <small className="text-secondary">Tags are separated with a comma</small>
            </>
          }

          {newField.length > 0 &&
            <div className="mt-4 row">
              <div className="col-5 text-center"><strong className="mr-2">Label Name</strong></div>
              <div className="col-7 text-center"><strong className="ml-2 mr-5">Value</strong></div>
            </div>
          }
          {newField.map((item, index) => (
            <div className="newField-div mt-2 row" key={item.Id} id={item.Id}>
              <div className="d-flex align-items-center col-5"><input type="text" value={item.Key} data-keyid={item.Id} onChange={updateKeyField} className={"newField-Key-" + item.Id + " form-control"} placeholder="Enter label name here" />:</div>
              <div className="d-flex align-items-center col-7"><input type="text" value={item.Value} data-keyid={item.Id} onChange={updateValueField} className={"newField-Value-" + item.Id + " form-control"} placeholder="Enter value here" /><X className="user-select-none pointer-cursor" size={25} color={'red'} id={item.Id} onClick={removeNewField} /></div>
              <span id={"errMsg-addField-" + item.Id} className="ml-3 mt-1 text-danger"></span>
            </div>
          ))}
          {newField.length > 0 &&
            <small className="text-secondary">Label name field is required to identify additional information (e.g. Details, Comments, Team, etc.)</small>
          }

          {props.errMsg1 &&
            <p className="text-danger">{props.errMsg1Text}</p>
          }

          <ButtonArea>
            <span className="user-select-none pointer-cursor text-danger" onClick={addNewField}><Plus size={30} color={'red'} />Add new Field</span>
            <div className="float-right">
              <Button variant="secondary" onClick={reset} disabled={loading}>Reset</Button>{' '}
              <Button variant="primary" onClick={save} disabled={loading}>Save</Button>{' '}
            </div>
          </ButtonArea>
        </div>
      </Sidebar>
    </Background>
  )
}

const EditItem = (props) => {
  if (props.editType == "Single") {
    return SingleEdit(props)
  }
  else {
    return BatchEdit(props)
  }
}

EditItem.propTypes = {
  setEditItem: PropTypes.func,
  index: PropTypes.arrayOf(PropTypes.string),
  renderRefresh: PropTypes.func,
  editType: PropTypes.string,
  draftKey: PropTypes.string,
  errMsg1: PropTypes.bool,
  setErrMsg1: PropTypes.func,
  errMsg1Text: PropTypes.string,
  setErrMsg1Text: PropTypes.func
}

export default EditItem

