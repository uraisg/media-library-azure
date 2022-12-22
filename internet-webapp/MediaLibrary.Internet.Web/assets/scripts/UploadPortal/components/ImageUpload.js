import React, { useEffect } from 'react'
import PropTypes from 'prop-types'

import { useForm, useBtnDisabled } from '@/components/AllContext'
import ImageInput from '@/components/ImageInput'

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
    <>
      <ImageInput />

      <p>Provide more information to make your images easier to find</p>
      <div>
        <label className="required" htmlFor="Name">Name</label>
        <input type="text" className="form-control" id="Name" onKeyUp={checkValid} defaultValue={formContext.validInput.Name} />
        <small className="form-text text-secondary">Give a brief title for the images, e.g., project or event name</small>
      </div>
      <div className="mt-2">
        <label className="required" htmlFor="Location">Location</label>
        <input type="text" className="form-control" id="Location" onKeyUp={checkValid} defaultValue={formContext.validInput.Location} />
        <small className="form-text text-secondary">Describe the landmark or road where the images were taken, e.g., Gardens By The Bay, Kampong Glam, Stamford Road</small>
      </div>
      <div className="mt-2">
        <label htmlFor="Copyright">Copyright Owner</label>
        <input type="text" className="form-control" onKeyUp={checkValid} defaultValue={formContext.validInput.Copyright} id="Copyright" />
        <small className="form-text text-secondary">Enter the copyright owner's name (Works you create in the course of employment are automatically owned by your employer)</small>
      </div>

      {props.errMsg &&
        <p className="text-danger">Fields cannot be empty</p>
      }

      {props.errMsg1 &&
        <p className="text-danger">{props.errMsg1Text}</p>
      }
    </>
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
