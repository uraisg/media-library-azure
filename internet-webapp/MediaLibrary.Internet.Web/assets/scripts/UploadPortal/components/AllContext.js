import React, { useState, useContext } from 'react'
import { Alert } from 'react-bootstrap'
import { X } from 'react-bootstrap-icons'

const FormContext = React.createContext()
const StepContext = React.createContext()

export function useForm() {
  return useContext(FormContext)
}

export function useBtnDisabled() {
  return useContext(StepContext)
}

export function FormProvider({ children }) {
  const [files, setFiles] = useState([])
  const [validInput, setValidInput] = useState({ "Name": "", "Location": "", "Copyright": "URA" })
  const [retrievedFile, setRetrievedFile] = useState([])
  const [alertActive, setAlertActive] = useState(false)

  return (
    <FormContext.Provider value={{ files: files, setFiles: setFiles, validInput: validInput, setValidInput: setValidInput, retrievedFile: retrievedFile, setRetrievedFile: setRetrievedFile, alertActive: alertActive, setAlertActive: setAlertActive }}>
      {alertActive &&
        <Alert variant={'success'} style={{ width: '90%', margin: '2% auto' }}>
        Your items have been uploaded successfully, and will be copied to intranet in 10 minutes.
          <span className="float-right"><X size={25} className="pointer-cursor" onClick={() => setAlertActive(false)} /></span>
        </Alert>
      }
      {children}
    </FormContext.Provider>
  )
}

export function StepCompleteProvider({ children }) {
  const [btnDisabled, setBtnDisabled] = useState(true)

  return (
    <StepContext.Provider value={{ btnDisabled: btnDisabled, setBtnDisabled: setBtnDisabled }}>
      {children}
    </StepContext.Provider>
  )
}
