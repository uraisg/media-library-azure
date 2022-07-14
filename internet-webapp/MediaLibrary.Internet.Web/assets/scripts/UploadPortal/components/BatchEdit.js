import { useState } from 'react'
import styled from 'styled-components'
import { X, Plus } from 'react-bootstrap-icons'
import { Button } from 'react-bootstrap'

import { useForm } from '@/components/AllContext'

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

const Title = styled.span`
  font-weight: bold;
  font-size: 1.2em;
`

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

const ButtonArea = styled.div`
  bottom: 1em;
  width: 92%;
  position: absolute;
`

export default function BatchEdit(props) {
  const formContext = useForm()
  const [newField, setNewField] = useState(checkAddField())
  const [loading, setLoading] = useState(false)
  const [errMsg, setErrMsg] = useState({Name: false, Location: false})

  const [defaultValue, setDefaultValue] = useState({ Name: "", Location: "", Copyright: "", Caption: "", Tags: "" })
  const [option, setOption] = useState({ Name: "nil", Location: "nil", Copyright: "nil", Caption: "nil", Tags: "nil" })
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

    return
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
    setDefaultValue({ Name: "", Location: "", Copyright: "", Caption: "", Tags: "" })
    setOption({ Name: "nil", Location: "nil", Copyright: "nil", Caption: "nil", Tags: "nil" })
    $(".update-option").val("nil")
    setNewField(checkAddField())
  }

  const checkValidField = () => {
    let err = false

    if (option.Name !== "nil" && defaultValue.Name === "") {
      setErrMsg(item => ({ ...item, Name: true }))
      err = true
    } else {
      setErrMsg(item => ({ ...item, Name: false }))
    }
    if (option.Location !== "nil" && defaultValue.Location === "") {
      setErrMsg(item => ({ ...item, Location: true }))
      err = true
    } else {
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
    },2000)
  }

  const off = () => {
    setNewField([])
    props.setBatchEdit(false)
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
              <select className="update-option form-control" defaultValue="nil" id="Name-select" onChange={handleOption}>
                {updateOption.map((item, index) => (
                  <option key={index} value={item.Value}>{item.Option}</option>
                ))}
              </select>
            </div>
          </div>

          {option.Name !== "nil" &&
            <>
              <input type="text" className="mt-2 form-control" id="Name" value={defaultValue.Name} onChange={updateField} placeholder="Edit name here" />
            {errMsg.Name &&
              <span className="text-danger">The Name field is required.</span>
            }
            </>
          }

          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Location:<span className="text-danger">*</span></strong></div>
            <div className="col-9">
              <select className="update-option form-control" defaultValue="nil" id="Location-select" onChange={handleOption}>
                {updateOption.map((item, index) => (
                  <option key={index} value={item.Value}>{item.Option}</option>
                ))}
              </select>
            </div>
          </div>

          {option.Location !== "nil" &&
            <>
              <input type="text" className="mt-2 form-control" id="Location" value={defaultValue.Location} onChange={updateField} placeholder="Edit location here" />
              {errMsg.Location &&
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
              <div className="col-5 text-center"><strong className="mr-2">Key</strong></div>
              <div className="col-7 text-center"><strong className="ml-2 mr-5">Value</strong></div>
            </div>
          }
          {newField.map((item, index) => (
            <div className="newField-div mt-2 row" key={item.Id} id={item.Id}>
              <div className="d-flex align-items-center col-5"><input type="text" value={item.Key} data-keyid={item.Id} onChange={updateKeyField} className={"newField-Key-" + item.Id + " form-control"} placeholder="Enter key here" />:</div>
              <div className="d-flex align-items-center col-7"><input type="text" value={item.Value} data-keyid={item.Id} onChange={updateValueField} className={"newField-Value-" + item.Id + " form-control"} placeholder="Enter value here" /><X className="user-select-none pointer-cursor" size={25} color={'red'} id={item.Id} onClick={removeNewField} /></div>
              <span id={"errMsg-addField-" + item.Id} className="ml-3 mt-1 text-danger"></span>
            </div>
          ))}
          {newField.length > 0 &&
            <small className="text-secondary">Key field is required to identify additional information (e.g. Details, Comments, Team, etc.)</small>
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
