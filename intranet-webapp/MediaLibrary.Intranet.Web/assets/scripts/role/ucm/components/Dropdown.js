import React, { useState, useEffect } from 'react'
import 'react-multiple-select-dropdown-lite/dist/index.css'
import { useFilter } from './@/../../../ucm/components/context'
import "react-datepicker/dist/react-datepicker.css";
import { Button , Form, InputGroup } from 'react-bootstrap'
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

  useEffect(() => {
    fetchData();
  }, [filterContext.active]);

  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = () => {
    const baseLocation = location
    let url = new URL('/api/acmRole/dropdownoptions', baseLocation)
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
        setRoleOptions(result.Item3)
      })
  };

  const [departmentOptions, setdepartmentOptions] = useState([]);
  const [department, setdepartment] = useState([]);
  const [GroupOptions, setgroupoptions] = useState([])
  const [Group, setgroup] = useState([])
  const [dropdownKey, setDropdownKey] = useState(0)


  const handledepartnmentchange = (newSelectedOptions) => {
    setdepartment(newSelectedOptions.map((o) => o.value));
    const temp = { ...filterContext.active, "filterbydepartment": newSelectedOptions.map((o) => o.value) }
    filterContext.setActive(temp)
  };


  const handleDropdownChange = (newSelectedOptions) => {
    setgroup(newSelectedOptions.map((o) => o.value))
    fetchData()
    const temp = { ...filterContext.active, "filterbygroup": newSelectedOptions.map((o) => o.value)}
     filterContext.setActive(temp)
  };

  const [RoleOptions, setRoleOptions] = useState([])
  const [role, setrole] = useState([])

  const handlerole = (newSelectedOptions) => {
    setrole(newSelectedOptions.map((o) => o.value))
    const temp = { ...filterContext.active, "filterbyrole": newSelectedOptions.map((o) => o.value) }
    filterContext.setActive(temp)
  };

  const [date, setDate] = useState({ "StartDate": "", "EndDate": "" })


  const handleStartDate = (e) => {
    const temp = { ...date, "StartDate": e.target.value }
    setDate(temp)


  }
  const handleEndDate = (e) => {
    const temp = { ...date, "EndDate": e.target.value }
    setDate(temp)
  }

   const handleClear = () => {
     filterContext.setResult([])
     setDate({ "StartDate": "", "EndDate": "" })
     setdepartment([]);
     setgroup([])
     setrole([])
     setDropdownKey((prevKey) => prevKey + 1);

     const temp = { ...filterContext.active, "StartDate": "", "EndDate": "", "filterbydepartment": [], "filterbygroup": [],"filterbyrole": [] }
     filterContext.setActive(temp)
   }

   const handleFilterBtn = () => {
     if ((date.StartDate != "" && date.EndDate != "")) {
       filterContext.setResult([])
       const temp = { ...filterContext.active, "filterbydepartment": department, "filterbygroup": Group, "filterbyrole": role, "StartDate": date.StartDate, "EndDate": date.EndDate }
       filterContext.setActive(temp)
     }
     else {
       const temp = { ...filterContext.active, "filterbydepartment": department, "filterbygroup": Group, "filterbyrole": role }
       filterContext.setActive(temp)
     }
   }

   return (
   <>
   <div className="shadow bg-white rounded mt-5 p-3  ">
         {date.StartDate == "" && date.EndDate != "" &&
           <p className="text-danger">Please select starting date for Last Login</p>
         }

         {date.StartDate != "" && date.EndDate == "" &&
           <p className="text-danger"> Please select ending date for Last Login</p>
         }

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
             {Group == "" ?(
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
               </tr>
             ) : (
                 <tr>
                   <th className="col-md-2" >Department</th>
                   <td>
                     <Select isDisabled={false} styles={customStyles} key={dropdownKey} onChange={handledepartnmentchange}
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
               <th className="col-md-2" >Role</th>
             <td>
                 <Select styles={customStyles} key={dropdownKey} onChange={handlerole}
                 isMulti
                   options={RoleOptions.map((e1) => ({
                   value: e1,
                   label: e1,
                 }))}
               />
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
          </tr>

             <tr>
               <td colSpan={2} style={{ textAlign: "end" }}>

                 <Button size="s"
                   className="btn btn-primary " onClick={handleFilterBtn} >
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
    </>
  )
}


