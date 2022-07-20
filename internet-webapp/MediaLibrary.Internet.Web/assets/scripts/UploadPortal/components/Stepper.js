import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import styled from 'styled-components'

import FormSteps from '@/components/FormSteps'
import Progressbar from '@/components/ProgressBar'
import { useForm, useBtnDisabled } from '@/components/AllContext'

const FormModel = styled.div`
  margin-block: 2em;
`

const steps = ['Image Upload', 'Preview & Update', 'Confirm Upload'];

export default function StepperForm() {
  const formContext = useForm()
  const stepCompleteContext = useBtnDisabled()

  const [activeStep, setActiveStep] = useState(0)
  const [progressBar, setProgressBar] = useState(false)
  const [completePercentage, setCompletePercentage] = useState(0)
  const [errMsg, setErrMsg] = useState(false)

  const handleNext = () => {
    window.scrollTo(0, 0)
    if (activeStep == 0) {
      if (validateInput()) {
        setCompletePercentage(100 / formContext.files.length / 2)
        uploadStep1()
        setErrMsg(false)
      }
    }
    else if (activeStep == 2) {
      uploadStep3()
    }
    else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  };

  const validateInput = () => {
    if (!formContext.validInput.Name || !formContext.validInput.Location || formContext.files.length == 0) {
      setErrMsg(true)
      return false
    }
    return true
  }

  const handleBack = () => {
    window.scrollTo(0, 0)
    if (activeStep == 1) {
      //Uncomment when api are completed
      //setRetrievedFile([])
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  };

  const uploadStep1 = () => {
    setProgressBar(true)

    const name = formContext.validInput.Name.trim()
    const location = formContext.validInput.Location.trim()
    const files = formContext.files
    //Call api here
    //Replace the first timeout with post and get api call
    setTimeout(() => {
      setCompletePercentage(100)
      setTimeout(() => {
        //insert get api result objects with setRetrievedFile
        setProgressBar(false)
        setActiveStep((prevActiveStep) => prevActiveStep + 1)
      }, 500)
    }, 3000)
  }

  const uploadStep3 = () => {
    setProgressBar(true)
    setCompletePercentage(20)

    //Call api here
    //Replace the first timeout with post api call
    setTimeout(() => {
      setCompletePercentage(100)
      setTimeout(() => {
        setProgressBar(false)
      }, 500)

      //Uncomment when api are completed
      //setRetrievedFile([])
      formContext.setAlertActive(true)
      setTimeout(() => { formContext.setAlertActive(false) }, 5000)
      formContext.setFiles([])
      formContext.setValidInput({ "Name": "", "Location": "" })
      setActiveStep(0)
    }, 4000)
  }

  return (
    <Box sx={{ width: '90%', margin: '2% auto' }}>
      {progressBar &&
        <Progressbar
        completed={completePercentage}
        setCompletePercentage={setCompletePercentage}
        activeStep={activeStep} />
      }

      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label, index) => {
          const stepProps = {}
          const labelProps = {}
          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>

      <FormModel>
        <FormSteps
          activeStep={activeStep}
          errMsg={errMsg}
          setErrMsg={setErrMsg}
          setActiveStep={setActiveStep} />
      </FormModel>

      <React.Fragment>
        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
        <button color="inherit" disabled={activeStep === 0} onClick={handleBack} className="btn btn-secondary">Back</button>

        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === 1 &&
          <span style={{ marginRight: '2%', marginTop: '0.5%' }}>Uploading {formContext.retrievedFile.length} image(s)</span>
          }

        <button onClick={handleNext} className="btn btn-primary" disabled={activeStep === 0 ? stepCompleteContext.btnDisabled : false}>
          {activeStep === steps.length - 1 ? 'Confirm' : 'Next'}
        </button>
        </Box>
      </React.Fragment>
    </Box>
  );
}
