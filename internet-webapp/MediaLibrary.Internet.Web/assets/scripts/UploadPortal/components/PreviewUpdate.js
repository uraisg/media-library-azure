import React, { useState, useEffect } from 'react'
import { styled } from '@linaria/react'
import { Modal, Button } from 'react-bootstrap'
import { ArrowClockwise, PencilSquare, Trash, X } from 'react-bootstrap-icons'
import { TailSpin } from 'react-loader-spinner'
import PropTypes from 'prop-types'

import EditItem from '@/components/EditItem'
import DisplayItem from '@/components/DisplayItem'
import { useForm } from '@/components/AllContext'

const Separator = styled.div`
  height: 1.25em;
  width: 1px;
  margin: 0 2px 0 10px;
  border-right: 1px solid #6c757d;
`

const ToolbarButton = styled(Button)`
  line-height: 1 !important;
	padding: 0.25em !important;
	border: none !important;
	border-radius: 3px !important;

  &:not(:focus):not(:hover):not(.focus):not(.hover), :disabled, .disabled {
    background-color: transparent !important;
  }
`;

const Checkbox = styled.input`
  height: 20px;
  width: 20px;
`
Checkbox.defaultProps = { type: 'checkbox' }

const Step2 = (props) => {
  const formContext = useForm()

  const [checkNo, setCheckNo] = useState(0)
  const [editItem, setEditItem] = useState(false)
  const [editType, setEditType] = useState("")
  const [index, setIndex] = useState([])
  const [deleteModal, setDeleteModal] = useState(false)
  const [refresh, setRefresh] = useState(false)
  const [imageData, setImageData] = useState(Array)
  const [errMsg2, setErrMsg2] = useState(false)
  const [errMsg2Text, setErrMsg2Text] = useState("")

 
  const renderRefresh = () => {
    setErrMsg2(false)
    setErrMsg2Text("")
    props.setErrMsg1(false)
    props.setErrMsg1Text("")
    setCheckNo(0)
    setIndex([])
    setEditItem(false)
    setEditType("")
    setDeleteModal(false)
    setRefresh(true)
    $('.item-chkbox').css("pointer-events", "none")
    $('#all-chkbox').css("pointer-events", "none")

    //Call api here
    fetch(`draft/${props.draftKey}`, {
      headers: {
        RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
      }
    })
      .then((res) => res.json())
      .then((res) => {
        if (!res.success) {
          setErrMsg1Text(res.errorMessage);
          setErrMsg1(true);
          setProgressBar(false);
          return;
        }

        const imageEntities = JSON.parse(res.result["imageEntities"])
        formContext.setRetrievedFile(imageEntities)
        setImageData(imageEntities)

        $('.item-chkbox').css("pointer-events", "auto")
        $('#all-chkbox').css("pointer-events", "auto")
        $('.item-chkbox').prop("checked", false)
        $('.item-list').removeClass("border bg-light")
        setRefresh(false)
      })
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
    const deleteDraft = async () => {
      // Delete draft as the draft is empty
      const response = await fetch(`draft/${props.draftKey}`, {
        method: 'DELETE',
        headers: {
          RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
        }
      })

      const responseData = await response.json();

      if (!responseData.success) {
        setErrMsg2(true);
        setErrMsg2Text(responseData.errorMessage);
        return false;
      }

      return true;
    }

    if (formContext.retrievedFile.length === 0) {
      deleteDraft().then((result) => {
        if (!result) {
          return;
        }

        formContext.setValidInput({ "Name": "", "Location": "", "Copyright": "URA" })
        formContext.setFiles([])
        props.setActiveStep(0)
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
    props.setErrMsg1(false)
    props.setErrMsg1Text("")

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

  

  const deleteItem = async () => {
    setErrMsg2(false);

    // Delete image
    for await (let file of index) {
      const response = await fetch(`draft/${props.draftKey}/${file}`, {
        method: 'DELETE',
        headers: {
          RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
        }
      })

      const responseData = await response.json();

      if (!responseData.success) {
        setErrMsg2(true);
        setErrMsg2Text(responseData.errorMessage);
        closeModal();
        return;
      }
    }

    closeModal()
    renderRefresh();
  }
  //try

  const declarationcheck = (e) => {
    console.log(formContext.declarationcheckbox);
    if (e.target.checked) {
      formContext.setdeclarationcheckbox(true);

    }
    if (!e.target.checked) { 
      formContext.setdeclarationcheckbox(false);
    }
    console.log(formContext.declarationcheckbox);
  }
  console.log(formContext.declarationcheckbox);

  return (
    <React.Fragment>
      {editItem &&
        <EditItem
          setEditItem={setEditItem}
          index={index}
          renderRefresh={renderRefresh}
          editType={editType}
          draftKey={props.draftKey}
          errMsg1={props.errMsg1}
          setErrMsg1={props.setErrMsg1}
          errMsg1Text={props.errMsg1Text}
          setErrMsg1Text={props.setErrMsg1Text}
        />
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


      <p className="ml-2">Confirm uploads and update information as needed</p>
      <div className="d-flex align-items-center shadow-sm p-3 mb-4 rounded" style={{ backgroundColor: "#f5f5f5", width: "1100px", height: "50px" }}>
        <Checkbox title="Select" className="mr-2 ml-1 mt-2" onClick={declarationcheck} />
       I declare that I have uploaded images classified as ‘Restricted \ Sensitive Normal’ or below. <span className="text-danger">*</span>
      </div>

      <div className="d-flex align-items-center " role="toolbar">
        <Checkbox className="ml-3" onClick={setAllCheck} id="all-chkbox" title="Select" />

        <Separator />


        <ToolbarButton variant="light" className="ml-1" onClick={renderRefresh} disabled={refresh} title="Refresh">
          {refresh ? (
            <TailSpin height="20" width="20" aria-label="loading"/>
          ) : (
            <ArrowClockwise size={20} aria-label="refresh"/>
          )}
        </ToolbarButton>

        <ToolbarButton variant="light" className="ml-1" onClick={displayEdit} disabled={checkNo === 0} title="Edit">
          <PencilSquare size={20} aria-label="edit"/>
        </ToolbarButton>

        <ToolbarButton variant="light" className="ml-1" onClick={openModal} disabled={checkNo === 0} title="Delete">
          <Trash size={20} aria-label="delete"/>
        </ToolbarButton>
      </div>

      {errMsg2 &&
        <p className="text-danger">{errMsg2Text}</p>
      }

      {imageData.map((item, key) => (
        <div key={item.Id}>
          <hr />
          <DisplayItem
            item={item}
            Key={item.Id}
            update={true}
            setCheckValue={setCheckValue}
            draftKey={props.draftKey}
          />
        </div>
      ))}
    </React.Fragment>
  )
}

Step2.propTypes = {
  activeStep: PropTypes.number,
  setActiveStep: PropTypes.func,
  draftKey: PropTypes.string,
  errMsg1: PropTypes.bool,
  setErrMsg1: PropTypes.func,
  errMsg1Text: PropTypes.string,
  setErrMsg1Text: PropTypes.func
}

export default Step2
