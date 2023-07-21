import { createContext, useState, useContext, useMemo } from 'react'
import { Alert } from 'react-bootstrap'
import { X } from 'react-bootstrap-icons'

const FormContext = createContext()
const StepContext = createContext()

export function useForm() {
  return useContext(FormContext)
}

export function useBtnDisabled() {
  return useContext(StepContext)
}

export function FormProvider({ children }) {
  const [files, setFiles] = useState([])
  const [validInput, setValidInput] = useState({ Name: '', Location: '', Copyright: 'URA' })
  const [declarationCheckbox, setDeclarationCheckbox] = useState(false)
  const [retrievedFile, setRetrievedFile] = useState([])
  const [alertActive, setAlertActive] = useState(false)

  const context = useMemo(
    () => ({
      files,
      setFiles,
      validInput,
      setValidInput,
      declarationCheckbox,
      setDeclarationCheckbox,
      retrievedFile,
      setRetrievedFile,
      alertActive,
      setAlertActive,
    }),
    [files, validInput, declarationCheckbox, retrievedFile, alertActive]
  )

  return (
    <FormContext.Provider value={context}>
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

  const context = useMemo(
    () => ({ btnDisabled, setBtnDisabled }),
    [btnDisabled]
  )

  return <StepContext.Provider value={context}>{children}</StepContext.Provider>
}
