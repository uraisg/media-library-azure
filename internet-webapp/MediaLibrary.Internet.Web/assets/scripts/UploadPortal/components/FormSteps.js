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
        setErrMsg={props.setErrMsg}
        errMsg1={props.errMsg1}
        setErrMsg1={props.setErrMsg1}
        errMsg1Text={props.errMsg1Text}
        setErrMsg1Text={props.setErrMsg1Text}
      />
    }
    {props.activeStep === 1 && 
        <Step2
        activeStep={props.activeStep}
        setActiveStep={props.setActiveStep}
        draftKey={props.draftKey}
        errMsg1={props.errMsg1}
        setErrMsg1={props.setErrMsg1}
        errMsg1Text={props.errMsg1Text}
        setErrMsg1Text={props.setErrMsg1Text}
      />
    }
    {props.activeStep === 2 &&
        <Step3
        draftKey={props.draftKey}
        errMsg1={props.errMsg1}
        setErrMsg1={props.setErrMsg1}
        errMsg1Text={props.errMsg1Text}
        setErrMsg1Text={props.setErrMsg1Text}
      />
      }
  </>
  )
}

FormSteps.propTypes = {
  activeStep: PropTypes.number,
  errMsg: PropTypes.bool,
  setErrMsg: PropTypes.func,
  setActiveStep: PropTypes.func,
  draftKey: PropTypes.string,
  errMsg1: PropTypes.bool,
  setErrMsg1: PropTypes.func,
  errMsg1Text: PropTypes.string,
  setErrMsg1Text: PropTypes.func
}

export default FormSteps
