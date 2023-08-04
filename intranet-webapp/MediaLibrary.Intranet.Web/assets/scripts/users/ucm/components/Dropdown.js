import React, { useState, useEffect } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useFilter } from './@/../../../ucm/components/context'
import "react-datepicker/dist/react-datepicker.css";
import { Button, Form, InputGroup } from 'react-bootstrap'
import { format } from 'date-fns'
import Select from 'react-select'


const customStyles = {
  control: (provided) => ({
    ...provided,
    width: '300px', 
  }),
  menu: (provided) => ({
    ...provided,
    width: '300px', 
  }),
};

export function formatDate(date) {
   const SHORT_DATE_FORMAT = 'd/M/yyyy'
  return format(new Date(date), SHORT_DATE_FORMAT)
}

 export const Filteruser = () => {
  const filterContext = useFilter()
   const [departmentOptions, setdepartmentOptions] = useState([]);
   const [department, setdepartment] = useState([]);
   const [GroupOptions, setgroupoptions] = useState([])
   const [Group, setgroup] = useState([])
   const [date, setDate] = useState({ "StartDate": "", "EndDate": "" })
   const [Suspenddate, setSuspendDate] = useState({ "SuspendStartDate": "", "SuspendEndDate": "" })
   const [dropdownKey, setDropdownKey] = useState(0);

   useEffect(() => {
     fetchData();
   }, []);

   useEffect(() => {
     fetchData();
   }, [filterContext.active]);
   const fetchData = () => {
     const baseLocation = location
     let url = new URL('/api/acm/dropdownoptions', baseLocation)
     url.search = new URLSearchParams(filterContext.active)

     fetch(url, {
       mode: 'same-origin',
       credentials: 'same-origin',
     }) 
       .then((response) => {
         if (!response.ok) {
           throw new Error(`Network response was not ok: ${response.status}`)
         }
         const contentType = response.headers.get('content-type')
         if (!contentType || !contentType.includes('application/json')) {
           throw new TypeError("Oops, we haven't got JSON!")
         }
         return response.json()
       })
       .then((result) => {
         setdepartmentOptions(result.Item1)
         setgroupoptions(result.Item2)
       })
   };
  
   const [status, setvalue] = useState([])
   const statusoption = [
     { label: ' Active', value: 'A' },
    // { label: 'Inactive', value: 'Inactive' },
     { label: 'Suspended', value: 'Suspended' },
   ]

   const handleStartDate = (e) => {
     const temp = { ...date, "StartDate": e.target.value }
     setDate(temp)
     
   }
   const handleEndDate = (e) => {
     const temp = { ...date, "EndDate": e.target.value }
     setDate(temp)
   }

   const handleSuspendStartDate = (e) => {
     const temp = { ...Suspenddate, "SuspendStartDate": e.target.value }
     setSuspendDate(temp)

   }
   const handleSuspendEndDate = (e) => {
     const temp = { ...Suspenddate, "SuspendEndDate": e.target.value }
     setSuspendDate(temp)
   }

   const handleDropdownChange = (newSelectedOptions) => {
     setgroup(newSelectedOptions.map((o) => o.value))
     const temp = { ...filterContext.active, "filterbygroup": newSelectedOptions.map((o) => o.value) }
     filterContext.setActive(temp)
   };

   const handlestatuschange = (newSelectedOptions) => {
     setvalue(newSelectedOptions.map((o) => o.value))
  
   };

   const handledepartnmentchange = (newSelectedOptions) => {
     setdepartment(newSelectedOptions.map((o) => o.value));
     const temp = { ...filterContext.active, "filterbydepartment": newSelectedOptions.map((o) => o.value) }
     filterContext.setActive(temp)

   };
   
   const handleClear = () => {
     filterContext.setResult([])
     setDate({ "StartDate": "", "EndDate": "" })
     setSuspendDate({ "SuspendStartDate": "", "SuspendEndDate": "" })
     setvalue([]);
     setdepartment([]);
     setgroup([])
     setDropdownKey((prevKey) => prevKey + 1);

     const temp = { ...filterContext.active, "StartDate": "", "EndDate": "", "SuspendStartDate": "", "SuspendEndDate": "", "filterbystatus": [], "filterbydepartment": [], "filterbygroup":[] }
     filterContext.setActive(temp)
   }

   const handleFilterBtn = () => {
     if ((date.StartDate != "" && date.EndDate != "") || (Suspenddate.SuspendStartDate != "" && Suspenddate.SuspendEndDate != "")) {
       filterContext.setResult([])
       const temp = { ...filterContext.active, "filterbydepartment": department, "filterbystatus": status, "filterbygroup": Group, "StartDate": date.StartDate, "EndDate": date.EndDate, "SuspendStartDate": Suspenddate.SuspendStartDate, "SuspendEndDate": Suspenddate.SuspendEndDate }
       filterContext.setActive(temp)
     }
     else {
       const temp = { ...filterContext.active, "filterbydepartment": department, "filterbystatus": status, "filterbygroup": Group}
       filterContext.setActive(temp)
     }
   }


   return (
     <React.Fragment >
       {date.StartDate == "" && date.EndDate != "" &&
         <p className="text-danger">Please select starting date for Last Login</p>
       }

       {date.StartDate != "" && date.EndDate == "" &&
         <p className="text-danger"> Please select ending date for Last Login</p>
       }

       {Suspenddate.SuspendStartDate == "" && Suspenddate.SuspendEndDate != "" &&
         <p className="text-danger"> Please select starting suspended date </p>
       }

       {Suspenddate.SuspendStartDate != "" && Suspenddate.SuspendEndDate == "" &&
         <p className="text-danger"> Please select ending suspended date</p>
       }


    <div className="shadow bg-white rounded mt-4 p-3  ">
       
      <table className=" table table-borderless table-responsive-lg table-sm">
        <tbody>
        
           <tr>
             <th className="col-md-2" >Group</th>
             <td>
               <Select styles={customStyles} key={dropdownKey} onChange={handleDropdownChange}
                 isMulti
                 options={GroupOptions.map((e1) => ({
                   value: e1,
                   label: e1,
                 }))}
               />
             </td>
           </tr>
             {Group == "" ? (
               <tr>
                 <th className="col-md-2" >Department</th>
                 <td>
                   <Select isDisabled={true} styles={customStyles} key={dropdownKey} onChange={handledepartnmentchange}
                     isMulti
                     options={departmentOptions.map((e1) => ({
                       value: e1,
                       label: e1,
                     }))}
                   />
                 </td>
               </tr>) : (
                 <tr>
                   <th className="col-md-2" >Department</th>
                   <td>
                     <Select isDisabled={false}  styles={customStyles} key={dropdownKey} onChange={handledepartnmentchange}
                       isMulti
                       options={departmentOptions.map((e1) => ({
                         value: e1,
                         label: e1,
                       }))}
                     />
                   </td>
                 </tr>
               )}
        
          <tr>
            <th className="col-md-2" >Status</th>
            <td >
                 <div className="app">
                   <Select styles={customStyles} key={dropdownKey} onChange={handlestatuschange}
                     isMulti
                     options={statusoption}
                     selectedValues={status}
                   />
   
              </div>
            </td>
             </tr>
             <tr>
               <th className="col-md-2">Suspended Date</th>
               <td className="col-12 col-md-8">
                 
                   <div style={{ display: "flex" }}>
                     <Form.Group>
                       <InputGroup>
                         <InputGroup.Text className="filter-date-text">From</InputGroup.Text>
                         <Form.Control
                         id="id"
                           type="date"
                           value={Suspenddate.SuspendStartDate}
                           onChange={handleSuspendStartDate}
                      
                         />
                       </InputGroup>
                     </Form.Group>

                     <Form.Group>
                       <InputGroup>
                         <InputGroup.Text className="filter-date-text">To</InputGroup.Text>
                         <Form.Control
                           type="date"
                           value={Suspenddate.SuspendEndDate}
                           onChange={handleSuspendEndDate}
                         />
                       </InputGroup>
                     </Form.Group>
                   </div>
                  </td>
             </tr>

          <tr>
            <th className="col-md-2">Last Login Date</th>
            <td className="col-12 col-md-8">

                <div style={{ display: "flex" }}>
                     <Form.Group>
                       <InputGroup>
                         <InputGroup.Text className="filter-date-text">From</InputGroup.Text>
                         <Form.Control
                           type="date"
                           value={date.StartDate}
                           onChange={handleStartDate}
                         />
                       </InputGroup>
                     </Form.Group>

                     <Form.Group>
                       <InputGroup>
                         <InputGroup.Text className="filter-date-text">To</InputGroup.Text>
                         <Form.Control
                           type="date"
                           value={date.EndDate}
                           onChange={handleEndDate}
                          
                         />
                       </InputGroup>
                     </Form.Group>
                </div>
            </td>
            <td>
              <Button size="s"
                className="btn btn-primary " onClick={handleFilterBtn } >
                   Apply
              </Button>

              <Button size="s"
               variant="outline-primary" className=" ml-2 " onClick={handleClear}>
                Reset
              </Button>

            </td>
          </tr>

        </tbody>
      </table>
       </div>
    </React.Fragment>
  )
}


