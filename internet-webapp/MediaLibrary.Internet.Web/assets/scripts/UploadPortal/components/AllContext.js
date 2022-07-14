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
  const [validInput, setValidInput] = useState({"Name": "", "Location": ""})
  const [retrievedFile, setRetrievedFile] = useState([{
    UploadId: "oasnd-192asd-12398asd-123asdasd",
    Id: 1,
    ImageURL: "https://cloudfront-us-east-2.images.arcpublishing.com/reuters/QUJB2YD4KRKB5OPGTIRL6A7M3A.jpg",
    Name: "Construction Site",
    Location: "Serangoon",
    Copyright: "URA",
    PlanningArea: "SERANGOON",
    Caption: "Example2",
    Tags: "Example1,Example2, Example3",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM",
    AdditionalField: [{ "Id": "97523eee841d5", "Key": "Details", "Value": "2 people on site" }]
  },
  {
    UploadId: "oasnd-192asd-12398asd-123asdasd",
    Id: 2,
    ImageURL: "https://d33wubrfki0l68.cloudfront.net/663d2c761439a867ad0547acbfb5396c4ee730ae/cc885/static/10be8217b3a21557d28597f852a3677c/2a8be/consturction-site-risk-movement.jpg",
    Name: "Construction Site",
    Location: "Serangoon",
    Copyright: "URA",
    PlanningArea: "SERANGOON",
    Caption: "Example3",
    Tags: "Example1,Example2",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM",
    AdditionalField: [{ "Id": "97523eee841d6", "Key": "Details", "Value": "2 people on site" }]
  },
  {
    UploadId: "oasnd-192asd-12398asd-123asdasd",
    Id: 3,
    ImageURL: "https://envuetelematics.com/wp-content/uploads/2019/07/Construction-Asset-Management.jpg",
    Name: "Construction Site",
    Location: "Serangoon",
    Copyright: "URA",
    PlanningArea: "SERANGOON",
    Caption: "Example4",
    Tags: "Example1,Example2,Example3",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM",
    AdditionalField: []
  },
  {
    UploadId: "oasnd-192asd-12398asd-123asdasd",
    Id: 4,
    ImageURL: "https://www.wpowerproducts.com/wp-content/uploads/2020/02/construction-site.jpg",
    Name: "Construction Site",
    Location: "Serangoon",
    Copyright: "URA",
    PlanningArea: "SERANGOON",
    Caption: "Example5",
    Tags: "Example1,Example2,Example3,Example4",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM",
    AdditionalField: []
  },
  {
    UploadId: "oasnd-192asd-12398asd-123asdasd",
    Id: 5,
    ImageURL: "https://image.vietnamnews.vn/uploadvnnews/Article/2021/9/17/175160_mt.jpg",
    Name: "Construction Site",
    Location: "Serangoon",
    Copyright: "URA",
    PlanningArea: "SERANGOON",
    Caption: "Example6",
    Tags: "Example1",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM",
    AdditionalField: []
  },
  {
    UploadId: "oasnd-192asd-12398asd-123asdasd",
    Id: 6,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--CBRgSCmB--/f_auto,q_auto/c_fill,g_auto,h_676,w_1200/construction-site--workers-in-singapore--1-_0.jpg?itok=G13iNssK",
    Name: "Construction Site",
    Location: "Serangoon",
    Copyright: "URA",
    PlanningArea: "SERANGOON",
    Caption: "Example7",
    Tags: "Example1,Example2,Example3,Example4,Example5,Example6",
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
