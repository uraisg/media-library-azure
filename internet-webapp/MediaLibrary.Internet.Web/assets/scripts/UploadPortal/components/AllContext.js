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
  const [validInput, setValidInput] = useState({"Name": "", "Location": "", "Copyright": "URA"})
  const [retrievedFile, setRetrievedFile] = useState([{
    UploadId: "oasnd-192asd-12398asd-123asdasd",
    Id: 1,
    ImageURL: "https://cloudfront-us-east-2.images.arcpublishing.com/reuters/QUJB2YD4KRKB5OPGTIRL6A7M3A.jpg",
    Name: "Construction Site",
    Location: "Serangoon",
    Copyright: "URA",
    PlanningArea: "SERANGOON",
    Caption: "A large building with a lot of people",
    Tags: "people,building",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM",
    AdditionalField: []
  },
  {
    UploadId: "oasnd-192asd-12398asd-123asdasd",
    Id: 2,
    ImageURL: "https://d33wubrfki0l68.cloudfront.net/663d2c761439a867ad0547acbfb5396c4ee730ae/cc885/static/10be8217b3a21557d28597f852a3677c/2a8be/consturction-site-risk-movement.jpg",
    Name: "Construction Site",
    Location: "Serangoon",
    Copyright: "URA",
    PlanningArea: "SERANGOON",
    Caption: "a land with cranes",
    Tags: "sand,land,crane",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM",
    AdditionalField: []
  }])
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
