import React, { useState, useContext } from 'react'
import { Alert } from 'react-bootstrap'
import { X } from 'react-bootstrap-icons'

const FileContext = React.createContext()
const CompleteContext = React.createContext()
const StepContext = React.createContext()
const SingleEditContext = React.createContext()

export function useFile() {
  return useContext(FileContext)
}

export function useUploadAlert() {
  return useContext(CompleteContext)
}

export function useBtnDisabled() {
  return useContext(StepContext)
}

export function useSingleEdit() {
  return useContext(SingleEditContext)
}

export function FileProvider({ children }) {

  const [retrievedFile, setRetrievedFile] = useState([{
    UploadId: "asjdn",
    Id: 1,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test",
    Location: "Test",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example2",
    Tags: "Example2",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "sodifnos",
    Id: 2,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test2",
    Location: "Test2",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example3",
    Tags: "Example3",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "weofnowenf",
    Id: 3,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test3",
    Location: "Test3",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example4",
    Tags: "Example4",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "oj0iajsdf",
    Id: 4,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test4",
    Location: "Test4",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example5",
    Tags: "Example5",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "aijsnc9unw",
    Id: 5,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test5",
    Location: "Test5",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example6",
    Tags: "Example6",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "kajsnunq",
    Id: 6,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test6",
    Location: "Test6",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example7",
    Tags: "Example7",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "aoisnciuwn",
    Id: 7,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test7",
    Location: "Test7",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example8",
    Tags: "Example8",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "asojdnajdn",
    Id: 8,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test8",
    Location: "Test8",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example9",
    Tags: "Example9",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "oaisndoiasnd",
    Id: 9,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test9",
    Location: "Test9",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example10",
    Tags: "Example10",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "aoisncioqncw",
    Id: 10,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test10",
    Location: "Test10",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example11",
    Tags: "Example11",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "oianscoiunqa",
    Id: 11,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test11",
    Location: "Test11",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example12",
    Tags: "Example12",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "oaisndoasod",
    Id: 12,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test12",
    Location: "Test12",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example13",
    Tags: "Example13",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "ajcsnoasun",
    Id: 13,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test13",
    Location: "Test13",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example14",
    Tags: "Example14",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
  },
  {
    UploadId: "ojansdjona",
    Id: 14,
    ImageURL: "https://onecms-res.cloudinary.com/image/upload/s--bG6Js-NF--/f_auto%2Cq_auto/c_fill%2Cg_auto%2Ch_622%2Cw_830/v1/mediacorp/tdy/image/2022/03/11/20220310_bk_million_dollar_yishun_hdb_flat_1.jpg?itok=OEccwAiQ",
    Name: "Test14",
    Location: "Test14",
    Copyright: "",
    PlanningArea: "Yishun",
    Caption: "Example15",
    Tags: "Example15",
    TakenDate: "28th June 2022, 19:28 PM",
    UploadDate: "28th June 2022, 19:28 PM"
    },
    {
      UploadId: "ajsdnjasnd",
      Id: 15,
      ImageURL: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Jurong_Bird_Park%2C_Singapore.jpg",
      Name: "Jurong Bird Park",
      Location: "Jurong",
      Copyright: "",
      PlanningArea: "Jurong",
      Caption: "Trees beside walking path",
      Tags: "trees,people,road",
      TakenDate: "28th June 2022, 19:28 PM",
      UploadDate: "28th June 2022, 19:28 PM"
    }])
  
  return (
    <FileContext.Provider value={{ retrievedFile: retrievedFile, setRetrievedFile: setRetrievedFile }}>
      { children }
    </FileContext.Provider>
  )
}

export function UploadCompleteProvider({ children }) {
  const [alertActive, setAlertActive] = useState(false)

  return (
    <CompleteContext.Provider value={{ alertActive: alertActive, setAlertActive: setAlertActive }}>
      {alertActive &&
        <Alert variant={'success'} style={{ width: '90%', margin: '2% auto' }}>
        Upload is completed
        <span style={{ float: 'right' }}><X size={25} onClick={() => setAlertActive(false)} /></span>
        </Alert>
      }
      { children }
    </CompleteContext.Provider>
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

export function SingleEditProvider({ children }) {
  const [newField, setNewField] = useState([])

  return (
    <SingleEditContext.Provider value={{ newField: newField, setNewField: setNewField }}>
      {children}
    </SingleEditContext.Provider>
  )
}
