import React from 'react'
import PropTypes from 'prop-types'

import DisplayItem from '@/components/DisplayItem'
import { useForm } from '@/components/AllContext'

const Step3 = (props) => {
  const fileContext = useForm()

  return (
    <React.Fragment>
      <p>Please confirm image(s) shown below for upload</p>
      <p className="text-secondary">Uploading {fileContext.retrievedFile.length} image(s)</p>

      {props.errMsg1 &&
        <p className="text-danger">{props.errMsg1Text}</p>
      }

      {fileContext.retrievedFile.map((item, key) => (
        <div key={item.Id}>
          <hr />
          <DisplayItem item={item} Key={item.Id} update={false} draftKey={props.draftKey}/>
        </div>

      ))}
    </React.Fragment>
  )
}

Step3.propTypes = {
  draftKey: PropTypes.string,
  errMsg1: PropTypes.bool,
  setErrMsg1: PropTypes.func,
  errMsg1Text: PropTypes.string,
  setErrMsg1Text: PropTypes.func
}
export default Step3
