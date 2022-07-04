import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import styled from 'styled-components'

import Step1 from '@/components/ImageUpload'
import Step2 from '@/components/PreviewUpdate'
import Step3 from '@/components/ConfirmUpload'
import { useFile, useUploadAlert, useBtnDisabled } from '@/components/AllContext'

const FormModel = styled.div`
  margin-block: 2em;
`

const steps = ['Image Upload', 'Preview & Update', 'Confirm Upload'];

export default function StepperForm() {
  const fileContext = useFile()
  const uploadCompleteContext = useUploadAlert()
  const stepCompleteContext = useBtnDisabled()

  const [activeStep, setActiveStep] = useState(0)

  const handleNext = () => {
    window.scrollTo(0, 0)
    if (activeStep == 2) {
      uploadCompleteContext.setAlertActive(true)
      setActiveStep(0)
    }
    else {
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
  };

  const handleBack = () => {
    window.scrollTo(0, 0)
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  };

  return (
    <Box sx={{ width: '90%', margin: '2% auto' }}>
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
          {activeStep === 0 &&
            <Step1 />
          }
          {activeStep === 1 &&
            <Step2 />
          }
          {activeStep === 2 &&
            <Step3 />
          }
        </FormModel>
          <React.Fragment>
            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
              <button
                color="inherit"
                disabled={activeStep === 0}
                onClick={handleBack}
                className="btn btn-secondary"
              >
                Back
              </button>
              <Box sx={{ flex: '1 1 auto' }} />
              {activeStep === 1 &&
                <span style={{ marginRight: '2%', marginTop: '0.5%' }}>Uploading {fileContext.retrievedFile.length} image(s)</span>
              }
              <button onClick={handleNext} className="btn btn-primary" disabled={stepCompleteContext.btnDisabled}>
                {activeStep === steps.length - 1 ? 'Confirm' : 'Next'}
              </button>
            </Box>
          </React.Fragment>
    </Box>
  );
}
