import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { Modal, Button } from 'react-bootstrap'
import { ArrowClockwise, PencilSquare, Trash, X } from 'react-bootstrap-icons'
import { TailSpin } from 'react-loader-spinner'

import SingleEdit from '@/components/SingleEdit'
import BatchEdit from '@/components/BatchEdit'
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

export default function Step2(props) {
  const formContext = useForm()
  
  const [checkNo, setCheckNo] = useState(0)
  const [singleEdit, setSingleEdit] = useState(false)
  const [batchEdit, setBatchEdit] = useState(false)
  const [index, setIndex] = useState([])
  const [deleteModal, setDeleteModal] = useState(false)
  const [refresh, setRefresh] = useState(false)

  const renderRefresh = () => {
    setCheckNo(0)
    setIndex([])
    setSingleEdit(false)
    setBatchEdit(false)
    setDeleteModal(false)
    setRefresh(true)
    $('.item-chkbox').css("pointer-events", "none")
    $('#all-chkbox').css("pointer-events", "none")
    //Call api here
    //Replace first setTimeout
    setTimeout(() => {
      $('.item-chkbox').css("pointer-events", "auto")
      $('#all-chkbox').css("pointer-events", "auto")
      $('.item-chkbox').prop("checked", false)
      $('.item-list').removeClass("border bg-light")
      formContext.setRetrievedFile([{
        UploadId: "oasnd-192asd-12398asd-123asdasd",
        Id: 1,
        ImageURL: "https://cloudfront-us-east-2.images.arcpublishing.com/reuters/QUJB2YD4KRKB5OPGTIRL6A7M3A.jpg",
        Name: "Construction Site",
        Location: "Serangoon",
        Copyright: "URA",
        PlanningArea: "SERANGOON",
        Caption: "Example2",
        Tags: "Example1,Example2,Example3",
        TakenDate: "28th June 2022, 19:28 PM",
        UploadDate: "28th June 2022, 19:28 PM",
        AdditionalField: [{ "Id": "97523eee841d5", "Key": "Details", "Value": "2 people on site" }]
      },
      {
        UploadId: "oasnd-192asd-12398asd-123asdasd",
        Id: 2,
        ImageURL: "https://d33wubrfki0l68.cloudfront.net/663d2c761439a867ad0547acbfb5396c4ee730ae/cc885/static/10be8217b3a21557d28597f852a3677c/2a8be/consturction-site-risk-movement.jpg",
        Name: "Construction Site",
        Location: "Serangoon",
        Copyright: "URA",
        PlanningArea: "SERANGOON",
        Caption: "Example3",
        Tags: "Example1,Example2",
        TakenDate: "28th June 2022, 19:28 PM",
        UploadDate: "28th June 2022, 19:28 PM",
        AdditionalField: [{ "Id": "97523eee841d6", "Key": "Details", "Value": "2 people on site" }]
      },
      {
        UploadId: "oasnd-192asd-12398asd-123asdasd",
        Id: 3,
        ImageURL: "https://envuetelematics.com/wp-content/uploads/2019/07/Construction-Asset-Management.jpg",
        Name: "Construction Site",
        Location: "Serangoon",
        Copyright: "URA",
        PlanningArea: "SERANGOON",
        Caption: "Example4",
        Tags: "Example1,Example2,Example3",
        TakenDate: "28th June 2022, 19:28 PM",
        UploadDate: "28th June 2022, 19:28 PM",
        AdditionalField: []
      },
      {
        UploadId: "oasnd-192asd-12398asd-123asdasd",
        Id: 4,
        ImageURL: "https://www.wpowerproducts.com/wp-content/uploads/2020/02/construction-site.jpg",
        Name: "Construction Site",
        Location: "Serangoon",
        Copyright: "URA",
        PlanningArea: "SERANGOON",
        Caption: "Example5",
        Tags: "Example1,Example2,Example3,Example4",
        TakenDate: "28th June 2022, 19:28 PM",
        UploadDate: "28th June 2022, 19:28 PM",
        AdditionalField: []
      },
      {
        UploadId: "oasnd-192asd-12398asd-123asdasd",
        Id: 5,
        ImageURL: "https://image.vietnamnews.vn/uploadvnnews/Article/2021/9/17/175160_mt.jpg",
        Name: "Construction Site",
        Location: "Serangoon",
        Copyright: "URA",
        PlanningArea: "SERANGOON",
        Caption: "Example6",
        Tags: "Example1",
        TakenDate: "28th June 2022, 19:28 PM",
        UploadDate: "28th June 2022, 19:28 PM",
        AdditionalField: []
      },
      {
        UploadId: "oasnd-192asd-12398asd-123asdasd",
        Id: 6,
        ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--CBRgSCmB--/f_auto,q_auto/c_fill,g_auto,h_676,w_1200/construction-site--workers-in-singapore--1-_0.jpg?itok=G13iNssK",
        Name: "Construction Site",
        Location: "Serangoon",
        Copyright: "URA",
        PlanningArea: "SERANGOON",
        Caption: "Example7",
        Tags: "Example1,Example2,Example3,Example4,Example5,Example6",
        TakenDate: "28th June 2022, 19:28 PM",
        UploadDate: "28th June 2022, 19:28 PM",
        AdditionalField: []
        }])
      setRefresh(false)
    }, 2000)
  }

  const setCheckValue = (e) => {
    if (e.target.checked) {
      $(`#${e.target.id.replace("ChkBox", "Div")}`).addClass("border bg-light")
      setCheckNo(checkNo + 1)
      setIndex([...index, parseInt(e.target.id.replace("ChkBox", ""))])
    }
    else {
      $(`#${e.target.id.replace("ChkBox", "Div")}`).removeClass("border bg-light")
      setCheckNo(checkNo - 1)
      const arr = index.filter((item) => item !== parseInt(e.target.id.replace("ChkBox", "")));
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
      formContext.setValidInput({ "Name": "", "Location": "" })
      formContext.setFiles([])
      props.setActiveStep(0)
    }
  }, [formContext.retrievedFile])

  const setAllCheck = (e) => {
    if (e.target.checked) {
      $('.item-list').addClass("border bg-light")
      $('.item-chkbox').prop("checked", true)
      setCheckNo(formContext.retrievedFile.length)
      setIndex([])
      formContext.retrievedFile.map((item) => {
        setIndex(indexItem => [...indexItem, parseInt(item.Id)])
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
    if (checkNo == 1) {
      setSingleEdit(true)
      setBatchEdit(false)
    }
    else {
      setSingleEdit(false)
      setBatchEdit(true)
    }
  }

  const closeModal = () => setDeleteModal(false);
  const openModal = () => setDeleteModal(true);

  const deleteItem = () => {
    closeModal()
    setTimeout(() => {
      renderRefresh()
    }, 1000)
  }

  return (
    <React.Fragment>
        {singleEdit &&
          <SingleEdit setSingleEdit={setSingleEdit} index={index} renderRefresh={renderRefresh} />
        }
        {batchEdit &&
          <BatchEdit index={index} setBatchEdit={setBatchEdit} renderRefresh={renderRefresh} />
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
      {formContext.retrievedFile.map((item, key) => (
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
