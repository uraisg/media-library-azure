import React, { useState } from 'react'
import MultiSelect from 'react-multiple-select-dropdown-lite'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useFilter } from './@/../../../ucm/components/context'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styled from "styled-components";
import { Button } from 'react-bootstrap'

const Styles = styled.div`
 .react-datepicker-wrapper,
 .react-datepicker__input-container,
 .react-datepicker__input-container input {
   width: 175px;
 }

 .react-datepicker__close-icon::before,
 .react-datepicker__close-icon::after {
   background-color: grey;
 }
`;

export const Filteruser = () => {
  const filterContext = useFilter()
  const [department, setdepartment] = useState([])

  const handleOnchange = val => {
  const departmentarray = val.split(',');
  setdepartment(departmentarray)
  console.log(departmentarray)
  console.log(val) }

  const options = [
       { label: ' ISGG1', value: '1ISGG1' },
       { label: 'ISGG2', value: 'ISGG2' },
       { label: 'ISGG3', value: 'ISGG3' },
       { label: 'ISGG4', value: 'ISGG4' },
  ]

  const [Group, setvalue] = useState([])

  const handlegroup= val => {
    const grouparray = val.split(',');
    setvalue(grouparray)
    console.log(grouparray)
  }

  const groupoption = [
     { label: ' Group1', value: 'Group1' },
     { label: 'Group2', value: 'Group2' },
     { label: 'Group3', value: 'Group3' },
   ]

  const [role, setrole] = useState([])

  const handlerole = val => {
     const rolearray = val.split(',');
     setrole(rolearray)
   }

   const roleoptions = [
     { label: 'User', value: 'User' },
     { label: 'System Admin', value: 'System Admin' },
     { label: 'Role Admin', value: 'Role Admin' },
   ]

   const [permission, setpermission] = useState([])

   const handlepermission = val => {
     const permissionarray = val.split(',');
     setpermission(permissionarray)
   }

   const permissionoptions = [
     { label: 'Restricted', value: 'Restricted' },
     { label: 'Regular', value: 'Regular' },
  ]

   const [startDate, setStartDate] = useState(null);
   const [endDate, setEndDate] = useState(null);

   const handleClear = () => {
     filterContext.setResult([])
     filterContext.setActive({ ...filterContext.active })
   }

   const handleFilterBtn = () => {
     if ((startDate != null && endDate != null) || Group != "" || department != "" || role != "" || department != "") {
       const temp = {
         ...filterContext.active, "filterbydepartment": department, "filterbygroup": Group, "StartDate": startDate, "EndDate": endDate,
         "filterbyrole": role, "filterbypermission": permission
       }
       filterContext.setActive(temp)

       //test 
       filterContext.callapi()
     }
     else {
       console.log("All of the fields are not selected")
     }
   }

   return (
   <>
   <div className="shadow bg-white rounded mt-4 p-3  ">
       {startDate == null && endDate != null &&
           <p className="text-danger">Please select starting date</p>
         }

         {startDate != null && endDate == null &&
           <p className="text-danger">Please select ending date</p>
         }

      <table className=" table table-borderless table-responsive-lg table-sm">
        <tbody>
          <tr>
            <th className="col-md-2" >Department</th>
            <td>
              <div className="app">
                   <div className="preview-values">
                     {department}
                </div>

                <MultiSelect
                  onChange={handleOnchange}
                  options={options}
                />
              </div>
               </td>
               <td className="pr-5"><b>Group</b></td>
               <td className="pr-5">

                 <div >
                   <div className="preview-values">
                     {Group}
                   </div>

                   <MultiSelect
                     onChange={handlegroup}
                     options={groupoption}
                   />
                 </div>
               </td>

          </tr>

             <tr>
               <th className="col-md-2" >Role</th>
               <td >

                 <div >
                   <div className="preview-values">
                     {role}
                   </div>

                   <MultiSelect
                     onChange={handlerole}
                     options={roleoptions}
                   />
                 </div>
               </td>
               <td className="pr-5"><b>Permission</b></td>
               <td className="pr-5">

                 <div>
                   <div className="preview-values">
                     {permission}
                   </div>

                   <MultiSelect
                     onChange={handlepermission}
                     options={permissionoptions}
                   />
                 </div>
               </td>
             </tr>

          <tr>
            <th className="col-md-2">Last Login Date</th>
            <td className="col-12 col-md-8">
              <Styles>
                <div style={{ display: "flex" }}>
                  <DatePicker
                    isClearable
                    filterDate={d => {
                    return new Date() > d;
                    }}
                    placeholderText="Select Start Date"
                    selected={startDate}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    onChange={date => setStartDate(date)}
                  />
                  <p className="ml-2 mr-2">  to: </p>
                  <DatePicker
                    isClearable
                    filterDate={d => {
                      return new Date() > d;
                    }}
                    placeholderText="Select End Date"
                    selected={endDate}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    onChange={date => setEndDate(date)}
                  />
                </div>
                 </Styles> </td>
          </tr>

             <tr>
               <td colSpan={4} style={{ textAlign: "end" }}>

                 <Button size="s"
                   className="btn btn-primary " onClick={handleFilterBtn} >
                   Search
                 </Button>

                 <Button size="s"
                   className="btn btn-primary ml-2 " onClick={handleClear}>
                   Clear
                 </Button>

               </td>
             </tr>
        </tbody>
      </table>
       </div>
    </>
  )
}


