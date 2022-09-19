import React, { useState, useEffect } from 'react';
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

const StepperForm = () => {
  const formContext = useForm()
  const stepCompleteContext = useBtnDisabled()

  const [activeStep, setActiveStep] = useState(0)
  const [progressBar, setProgressBar] = useState(false)
  const [completePercentage, setCompletePercentage] = useState(0)
  const [errMsg, setErrMsg] = useState(false)
  const [draftKey, setDraftKey] = useState("")

  const handleNext = () => {
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
      window.scrollTo(0, 0)
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

  const uploadStep1 = async() => {
    setProgressBar(true)

    const name = formContext.validInput.Name.trim()
    const location = formContext.validInput.Location.trim()
    const copyright = formContext.validInput.Copyright.trim()
    const files = formContext.files

    const response = await fetch("draft/create", {
      method: 'POST'
    })

    const responseData = await response.json();
    const rowKey = responseData.rowKey;
    setDraftKey(rowKey);

    for await (var file of files) {
      var data = new FormData();
      data.append('name', name)
      data.append('location', location)
      data.append('copyright', copyright)
      data.append('file', file.file);

      await fetch(`draft/${rowKey}/addImage`, {
        method: 'POST',
        body: data
      })
    }

    setTimeout(() => {
      fetch(`draft/${rowKey}`)
        .then((response) => response.json())
        .then((response) => {
          try {
            var imageEntities = JSON.parse(response.imageEntities)
            formContext.setRetrievedFile(imageEntities)

            setProgressBar(false)
            setActiveStep((prevActiveStep) => prevActiveStep + 1)
            window.scrollTo(0, 0)
          }
          catch (e) {
            console.log(e)
          }
        })
    }, 2000)
  }

  const uploadStep3 = () => {
    setProgressBar(true)
    setCompletePercentage(20)

    //Call api here
    fetch(`FileUpload/${draftKey}`, {
      method: 'POST'
    })

    //Replace the first timeout with post api call
    setTimeout(() => {
      setCompletePercentage(100)
      setTimeout(() => {
        //Uncomment when api are completed
        //setRetrievedFile([])

        setProgressBar(false)
        formContext.setFiles([])
        formContext.setValidInput({ "Name": "", "Location": "", "Copyright": "URA" })
        setActiveStep(0)
        window.scrollTo(0, 0)
      }, 500)

      formContext.setAlertActive(true)
      setTimeout(() => { formContext.setAlertActive(false) }, 5000)
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
          setActiveStep={setActiveStep}
          draftKey={draftKey}
        />
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

export default StepperForm
