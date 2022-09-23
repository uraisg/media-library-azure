import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Modal, Button } from 'react-bootstrap'
import { ArrowClockwise, PencilSquare, Trash, X } from 'react-bootstrap-icons'
import { TailSpin } from 'react-loader-spinner'
import PropTypes from 'prop-types'

import EditItem from '@/components/EditItem'
import DisplayItem from '@/components/DisplayItem'
import { useForm } from '@/components/AllContext'

const VR = styled.div`
  height: 1.25em;
  width: 1px;
  margin: 0 10px;
  border: 1px solid black;
`

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  height: 20px;
  width: 20px;
`

const Step2 = (props) => {
  const formContext = useForm()

  const [checkNo, setCheckNo] = useState(0)
  const [editItem, setEditItem] = useState(false)
  const [editType, setEditType] = useState("")
  const [index, setIndex] = useState([])
  const [deleteModal, setDeleteModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [imageData, setImageData] = useState(Array)

  const renderRefresh = () => {
    setCheckNo(0)
    setIndex([])
    setEditItem(false)
    setEditType("")
    setDeleteModal(false)
    setRefresh(true)
    $('.item-chkbox').css("pointer-events", "none")
    $('#all-chkbox').css("pointer-events", "none")

    //Call api here
    fetch(`draft/${props.draftKey}`)
      .then((res) => res.json())
      .then((res) => {
        const imageEntities = JSON.parse(res.imageEntities)
        formContext.setRetrievedFile(imageEntities)
        setImageData(imageEntities)
      })

    //Replace first setTimeout
    setTimeout(() => {
      $('.item-chkbox').css("pointer-events", "auto")
      $('#all-chkbox').css("pointer-events", "auto")
      $('.item-chkbox').prop("checked", false)
      $('.item-list').removeClass("border bg-light")
      setRefresh(false)
    }, 1000)
  }

  const setCheckValue = (e) => {
    if (e.target.checked) {
      $(`#${e.target.id.replace("ChkBox", "Div")}`).addClass("border bg-light")
      setCheckNo(checkNo + 1)
      setIndex([...index, e.target.id.replace("ChkBox", "")])
    }
    else {
      $(`#${e.target.id.replace("ChkBox", "Div")}`).removeClass("border bg-light")
      setCheckNo(checkNo - 1)
      const arr = index.filter((item) => item !== e.target.id.replace("ChkBox", ""));
      setIndex(arr)
    }
  }

  useEffect(() => {
    if (checkNo == formContext.retrievedFile.length) {
      $('#all-chkbox').prop("checked", true)
    }
    else {
      $('#all-chkbox').prop("checked", false)
    }
  }, [checkNo]);

  useEffect(() => {
    if (formContext.retrievedFile.length === 0) {
      formContext.setValidInput({ "Name": "", "Location": "", "Copyright": "URA" })
      formContext.setFiles([])
      props.setActiveStep(0)

      // Delete draft as the draft is empty
      fetch(`draft/${props.draftKey}`, {
        method: 'DELETE'
      })
    }
  }, [formContext.retrievedFile])

  useEffect(() => {
    if (props.activeStep === 1) {
      renderRefresh();
    }
  }, [props.activeStep])

  const setAllCheck = (e) => {
    if (e.target.checked) {
      $('.item-list').addClass("border bg-light")
      $('.item-chkbox').prop("checked", true)
      setCheckNo(formContext.retrievedFile.length)
      setIndex([])
      formContext.retrievedFile.map((item) => {
        setIndex(indexItem => [...indexItem, item.Id])
      })
    }
    else {
      $('.item-list').removeClass("border bg-light")
      $('.item-chkbox').prop("checked", false)
      setCheckNo(0)
      setIndex([])
    }
  }

  const displayEdit = (e) => {
    setEditItem(true)
    if (checkNo == 1) {
      setEditType("Single")
    }
    else {
      setEditType("Batch")
    }
  }

  const closeModal = () => setDeleteModal(false);
  const openModal = () => setDeleteModal(true);

  const deleteItem = async() => {
    // Delete image
    for await (let file of index) {
      await fetch(`draft/${props.draftKey}/${file}`, {
        method: 'DELETE'
      })
    }

    closeModal()
    setTimeout(() => {
      renderRefresh();
    }, 1000)
  }

  return (
    <React.Fragment>
      {editItem &&
        <EditItem setEditItem={setEditItem} index={index} renderRefresh={renderRefresh} editType={editType} draftKey={props.draftKey}/>
      }


      <Modal show={deleteModal}>
        <Modal.Header>
          <Modal.Title>Confirm Delete</Modal.Title>
          <Modal.Title className="float-right"><X size={35} onClick={closeModal} /></Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to deleted the image(s)? This action cannot be undone.</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={deleteItem}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>

      <p>Confirm uploads and update information as needed</p>
      <div className="d-flex" >
        <Checkbox onClick={setAllCheck} id="all-chkbox" />
        <VR />
        {checkNo === 0 ?
          refresh ?
            <TailSpin
              height="20"
              width="20"
              color='grey'
              ariaLabel='loading'
              className="ml-2"
            />
            :
            <React.Fragment>
              <ArrowClockwise className="pointer-cursor" size={20} onClick={renderRefresh} />
            </React.Fragment>
          :
          <React.Fragment>
            <PencilSquare size={20} className="pointer-cursor" onClick={displayEdit} />
            <Trash size={20} className="pointer-cursor ml-2" onClick={openModal} />
          </React.Fragment>
        }
      </div>
      {imageData.map((item, key) => (
        <div key={item.Id}>
          <hr />
          <DisplayItem
            item={item}
            Key={item.Id}
            update={true}
            setCheckValue={setCheckValue} />
        </div>
      ))}
    </React.Fragment>
  )
}

Step2.propTypes = {
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
  draftKey: PropTypes.string
}

export default Step2
