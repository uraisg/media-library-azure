import React, { useState } from 'react'
import { styled } from '@linaria/react'
import Steps from 'rc-steps'
import { Button, Modal } from 'react-bootstrap'
import { Check2, X } from 'react-bootstrap-icons'

import FormSteps from '@/components/FormSteps'
import Progressbar from '@/components/ProgressBar'
import { useForm, useBtnDisabled } from '@/components/AllContext'

import 'rc-steps/assets/index.css'
import { useEffect } from 'react'

const steps = [
  { title: 'Upload Images' },
  { title: 'Preview & Confirm' },
]
const stepsIcons = {
  finish: <Check2 aria-label="finish" />,
}

const StepsContainer = styled.div`
  max-width: 720px;
  margin: 0 auto 1.5rem;
`

const StepperForm = () => {
  const formContext = useForm()
  const stepCompleteContext = useBtnDisabled()

  const [activeStep, setActiveStep] = useState(0)
  const [progressBar, setProgressBar] = useState(false)
  const [completePercentage, setCompletePercentage] = useState(0)
  const [errMsg, setErrMsg] = useState(false)
  const [errMsg1, setErrMsg1] = useState(false)
  const [errMsg1Text, setErrMsg1Text] = useState("")
  const [draftKey, setDraftKey] = useState("")
  const [cancelModal, setCancelModal] = useState(false);
  const [disabledBtn, setDisabledBtn] = useState(false);

  const closeModal = () => setCancelModal(false);
  const openModal = () => setCancelModal(true);

  useEffect(() => {
    let disable = false;

    for (const file of formContext.files) {
      if (file.file.size > 40000000) {
        disable = true;
        break;
      }
    }

    setDisabledBtn(disable);
  }, [formContext.files])

  const handleNext = () => {
    if (activeStep == 0) {
      if (validateInput()) {
        uploadStep1()
      }
    }
    else if (activeStep == 1) {
      uploadStep2()
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
    setActiveStep((prevActiveStep) => prevActiveStep - 1)
  };

  const uploadStep1 = async () => {
    let completedPer = 0;
    setCompletePercentage(completedPer);
    setProgressBar(true);
    setErrMsg(false);
    setErrMsg1(false);

    const name = formContext.validInput.Name.trim()
    const location = formContext.validInput.Location.trim()
    const copyright = formContext.validInput.Copyright.trim()
    const files = formContext.files

    const response = await fetch("draft/create", {
      method: 'POST',
      headers: {
        RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
      }
    })

    const responseData = await response.json();

    if (!responseData.success) {
      setErrMsg1Text(responseData.errorMessage);
      setErrMsg1(true);
      setProgressBar(false);
      return;
    }

    // Make the percentage bar 10% when Draft is created
    completedPer = 10;
    setCompletePercentage(completedPer);

    const rowKey = responseData.rowKey;
    setDraftKey(rowKey);

    for await (let file of files) {
      let data = new FormData();
      data.append('name', name)
      data.append('location', location)
      data.append('copyright', copyright)
      data.append('file', file.file);

      const response1 = await fetch(`draft/${rowKey}/addImage`, {
        method: 'POST',
        headers: {
          RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
        },
        body: data
      })

      if (!response1.ok) {
        setErrMsg1Text("An error has occured. Please try again.");
        setErrMsg1(true);
        setProgressBar(false);
        return;
      }

      const responseData1 = await response1.json();

      if (!responseData1.success) {
        setErrMsg1Text(responseData1.errorMessage);
        setErrMsg1(true);
        setProgressBar(false);
        return;
      }

      const addPercentage = (100 - 20) / formContext.files.length;
      completedPer += addPercentage
      setCompletePercentage(completedPer);
    }

    fetch(`draft/${rowKey}`)
      .then((response) => response.json())
      .then((response) => {
        if (!response.success) {
          setErrMsg1Text(response.errorMessage);
          setErrMsg1(true);
          setProgressBar(false);
          return;
        }

        try {
          const imageEntities = JSON.parse(response.result["imageEntities"])
          formContext.setRetrievedFile(imageEntities)

          setCompletePercentage(100);
          setProgressBar(false)
          setActiveStep((prevActiveStep) => prevActiveStep + 1)
          window.scrollTo(0, 0)
        }
        catch (e) {
          console.log(e);
          setErrMsg1Text(e);
          setErrMsg1(true);
          setProgressBar(false);
        }
      })
  }

  const uploadStep2 = () => {
    setProgressBar(true)
    setCompletePercentage(20)

    //Call api here
    fetch(`FileUpload/${draftKey}`, {
      method: 'POST',
      headers: {
        RequestVerificationToken: document.querySelector('meta[name="RequestVerificationToken"]').content
      }
    })
      .then((response) => response.json())
      .then((response) => {
        if (!response.success) {
          setErrMsg1Text(response.errorMessage);
          setErrMsg1(true);
          setProgressBar(false);
          return;
        }

        setCompletePercentage(100)

        setProgressBar(false)
        formContext.setFiles([])
        formContext.setValidInput({ "Name": "", "Location": "", "Copyright": "URA" })
        setActiveStep(0)
        window.scrollTo(0, 0)

        // Shows alert for "Uploading to intranet in 10 minutes"
        formContext.setAlertActive(true)
        setTimeout(() => { formContext.setAlertActive(false) }, 5000)
      })
  }

  return (
    <div className="py-3 px-lg-3">
      {progressBar && (
        <Progressbar
          completed={completePercentage}
          setCompletePercentage={setCompletePercentage}
          activeStep={activeStep}
        />
      )}

      <StepsContainer>
        <Steps
          current={activeStep}
          labelPlacement="vertical"
          icons={stepsIcons}
          items={steps}
        />
      </StepsContainer>

      <div className="mb-4">
        <FormSteps
          activeStep={activeStep}
          errMsg={errMsg}
          setErrMsg={setErrMsg}
          setActiveStep={setActiveStep}
          draftKey={draftKey}
          errMsg1={errMsg1}
          setErrMsg1={setErrMsg1}
          errMsg1Text={errMsg1Text}
          setErrMsg1Text={setErrMsg1Text}
        />
      </div>

      <div className="d-flex mb-4">
        {activeStep === 1 && (
          <Button variant="danger" onClick={openModal}>
            Cancel
          </Button>
        )}

        <div className="ml-auto d-flex align-items-center">
          {activeStep === 1 && (
            <span className="mr-3">
              Uploading {formContext.retrievedFile.length} image(s)
            </span>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={disabledBtn ? true :
              activeStep === 0 ?
                stepCompleteContext.btnDisabled :
                false
            }
          >
            {activeStep === steps.length - 1 ? 'Confirm' : 'Next'}
          </Button>
        </div>
      </div>

      <React.Fragment>
        <Modal show={cancelModal}>
          <Modal.Header>
            <Modal.Title>Confirm Cancel</Modal.Title>
            <Modal.Title className="float-right"><X size={35} onClick={closeModal} /></Modal.Title>
          </Modal.Header>
          <Modal.Body>Are you sure you want to cancel this process? This action cannot be undone.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => {
              handleBack();
              closeModal();
            }}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </React.Fragment>
    </div>
  )
}

export default StepperForm
