import Step1 from '@/components/ImageUpload'
import Step2 from '@/components/PreviewUpdate'
import Step3 from '@/components/ConfirmUpload'

export default function FormSteps(props) {
  return (
  <>
    {props.activeStep === 0 && 
      <Step1
      errMsg={props.errMsg}
      setErrMsg={props.setErrMsg} />
    }
    {props.activeStep === 1 && 
      <Step2
      setActiveStep={props.setActiveStep} />
    }
    {props.activeStep === 2 &&
      <Step3 />
      }
  </>
  )
}
