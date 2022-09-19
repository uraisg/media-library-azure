import PropTypes from 'prop-types'

import Step1 from '@/components/ImageUpload'
import Step2 from '@/components/PreviewUpdate'
import Step3 from '@/components/ConfirmUpload'

const FormSteps = (props) => {
  return (
  <>
    {props.activeStep === 0 && 
      <Step1
      errMsg={props.errMsg}
      setErrMsg={props.setErrMsg} />
    }
    {props.activeStep === 1 && 
        <Step2
        activeStep={props.activeStep}
        setActiveStep={props.setActiveStep}
        draftKey={props.draftKey}
      />
    }
    {props.activeStep === 2 &&
        <Step3
        draftKey={props.draftKey}
      />
      }
  </>
  )
}

FormSteps.propTypes = {
  activeStep: PropTypes.number,
  errMsg: PropTypes.string,
  setErrMsg: PropTypes.func,
  setActiveStep: PropTypes.func,
  draftKey: PropTypes.string
}

export default FormSteps
