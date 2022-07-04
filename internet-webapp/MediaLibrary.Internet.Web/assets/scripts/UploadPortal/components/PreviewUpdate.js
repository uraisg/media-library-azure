import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { ArrowClockwise, PencilSquare, Trash } from 'react-bootstrap-icons'

import SingleEdit from '@/components/SingleEdit'
import BatchEdit from '@/components/BatchEdit'
import DisplayItem from '@/components/DisplayItem'
import { useFile, SingleEditProvider } from '@/components/AllContext'

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

export default function Step2() {
    const fileContext = useFile()

    const [checkNo, setCheckNo] = useState(0)
    const [singleEdit, setSingleEdit] = useState(false)
    const [batchEdit, setBatchEdit] = useState(false)
    const [index, setIndex] = useState([])

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
        if (checkNo == fileContext.retrievedFile.length) {
            $('#all-chkbox').prop("checked", true)
        }
        else {
            $('#all-chkbox').prop("checked", false)
        }
    });

    const setAllCheck = (e) => {
        if (e.target.checked) {
            $('.item-list').addClass("border bg-light")
            $('.item-chkbox').prop("checked", true)
            setCheckNo(fileContext.retrievedFile.length)
        }
        else {
            $('.item-list').removeClass("border bg-light")
            $('.item-chkbox').prop("checked", false)
            setCheckNo(0)
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

    return (
        <React.Fragment>
        {singleEdit &&
          <SingleEditProvider>
          <SingleEdit setSingleEdit={setSingleEdit} index={index} />
          </SingleEditProvider>
        }
        {batchEdit &&
          <BatchEdit index={index} setBatchEdit={setBatchEdit} />
        }
            <p>Confirm uploads and update information as needed</p>
            <div className="d-flex" >
                <Checkbox onClick={setAllCheck} id="all-chkbox" />
                <VR />
                {checkNo === 0 ?
                    <React.Fragment>
                        <ArrowClockwise size={20} />
                    </React.Fragment>
                    :
                    <React.Fragment>
                        <PencilSquare size={20} onClick={displayEdit} />
                        <Trash size={20} className="ml-2" />
                    </React.Fragment>
                }
            </div>
            {fileContext.retrievedFile.map((item, key) => (
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
