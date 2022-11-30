import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import FileInput from '@/components/ImageInput'
import { useForm, useBtnDisabled } from '@/components/AllContext'

const Step1 = (props) => {
  const formContext = useForm()
  const btnDisabled = useBtnDisabled()

  function checkValid(e) {
    formContext.setValidInput(item => ({ ...item, [e.target.id]: e.target.value }))
  }

  useEffect(() => {
    if (formContext.files.length != 0 && formContext.validInput.Name && formContext.validInput.Location) {
      btnDisabled.setBtnDisabled(false)
    }
    else if (formContext.files.length == 0 || !formContext.validInput.Name || !formContext.validInput.Location) {
      btnDisabled.setBtnDisabled(true)
    }
  })

  return (
    <React.Fragment>
      <p>Up to 40 MB of images is accepted, up to 25 images is accepted</p>
      <FileInput />

      <p>Provide more information to make your images easier to find</p>
      <div className="form-check">
        <label htmlFor="Name">Name<span className="text-danger">*</span></label>
        <input type="text" className="form-control" id="Name" onKeyUp={checkValid} defaultValue={formContext.validInput.Name} />
        <small className="text-secondary">Give a brief title for the images, e.g., project or event name</small>
      </div>
      <div className="mt-2 form-check">
        <label htmlFor="Location">Location<span className="text-danger">*</span></label>
        <input type="text" className="form-control" id="Location" onKeyUp={checkValid} defaultValue={formContext.validInput.Location} />
        <small className="text-secondary">Describe the landmark or road where the images were taken, e.g., Gardens By The Bay, Kampong Glam, Stamford Road</small>
      </div>
      <div className="mt-2 form-check">
        <label htmlFor="Copyright">Copyright Owner</label>
        <input type="text" className="form-control" onKeyUp={checkValid} defaultValue={formContext.validInput.Copyright} id="Copyright" />
        <small className="text-secondary">Enter the copyright owner's name (Works you create in the course of employment are automatically owned by your employer)</small>
      </div>

      {props.errMsg &&
        <p className="text-danger">Fields cannot be empty</p>
      }

      {props.errMsg1 &&
        <p className="text-danger">{props.errMsg1Text}</p>
      }
    </React.Fragment >
   )
}

Step1.propTypes = {
  errMsg: PropTypes.bool,
  setErrMsg: PropTypes.func,
  errMsg1: PropTypes.bool,
  setErrMsg1: PropTypes.func,
  errMsg1Text: PropTypes.string,
  setErrMsg1Text: PropTypes.func
}

export default Step1
