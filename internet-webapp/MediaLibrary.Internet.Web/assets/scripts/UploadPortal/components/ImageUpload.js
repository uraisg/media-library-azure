import React, { useState, useEffect } from 'react'

import FileInput from '@/components/ImageInput'
import { useBtnDisabled } from '@/components/AllContext'

export default function Step1() {
  const [files, setFiles] = useState([])
  const [checkName, setCheckName] = useState(false)
  const [checkLocation, setCheckLocation] = useState(false)

  const btnDisabled = useBtnDisabled()

  function checkValid(e) {
    if (e.target.value != "") {
      setValue(e.target.id, true)
    }
    else {
      setValue(e.target.id, false)
    }
  }

  function setValue(item, value) {
    switch (item) {
      case "name":
        setCheckName(value)
        break
      case "location":
        setCheckLocation(value)
    }
  }

  useEffect(() => {
    if (files.length != 0 && checkName && checkLocation) {
      btnDisabled.setBtnDisabled(false)
    }
    else if (files.length == 0 || !checkName || !checkLocation) {
      btnDisabled.setBtnDisabled(true)
    }
  })

  return (
    <React.Fragment>
      <form>
        <p>Up to 40 MB of images is accepted</p>
        <FileInput files={files} setFiles={setFiles} />

        <p>Provide more information to make your images easier to find</p>
        <div className="form-check">
          <label htmlFor="Name">Name<span className="text-danger">*</span></label>
          <input type="text" className="form-control" id="name" onKeyUp={checkValid} />
        </div>
        <div className="form-check">
          <label htmlFor="Location">Location<span className="text-danger">*</span></label>
          <input type="text" className="form-control" id="location" onKeyUp={checkValid} />
        </div>
        <div className="form-check">
          <label htmlFor="Copyright">Copyright Owner</label>
          <input type="text" className="form-control" defaultValue="URA" id="copyright" />
        </div>
      </form>
    </React.Fragment >
   )
}
