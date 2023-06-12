import { React } from "react";
import { useState, useEffect } from "react";
import { useFilter } from './@/../../../ucm/components/context'
import { Button } from 'react-bootstrap'
import { styled } from '@linaria/react'
import { format } from 'date-fns'
import Select from 'react-select'

const TopDiv = styled.div`
  display: relative;
  @media only screen and (max-width: 799px) {
      display: block
  }
`

const LeftDiv = styled.div`
  display: inline-block;
  width: 60%;
  margin-top:2.5em;
`

const SelectTableComponent = () => {
  const filtercontext = useFilter()
  const SHORT_DATE_FORMAT = 'dd/MM/yyyy'
  const [SelectRowOptions, setSelectedRoleOptions] = useState([])
  const [selectedValue, setSelectedValue] = useState('');


  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    const baseLocation = location
    let url = new URL('/api/acmRole/RoleOptions', baseLocation)
    url.search = new URLSearchParams(filtercontext.active)

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
        setSelectedRoleOptions(result)

      })
  };


  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const handleSelectAll = e => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(filtercontext.result.map(li => li.id));

    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const [roleCheck, setRoleCheck] = useState([]);
  const [rowindex, SetrowIndex] = useState()

 
  const [UserIDRoles,setUserIDRoles] = useState([])

  const handleClick = (index, itemId) => {
    const data = filtercontext.result
    SetrowIndex(index)

    const data2 = data[index].role
    const { id, checked } = itemId.target;
    setIsCheck([...isCheck, id]);

 
    setRoleCheck([...roleCheck, data2]);

    const filteredData = filtercontext.result.filter((i) => i.id.includes(id) && i.role !== data2);
    const CheckUseridRoles = filteredData.map((items) => items.role);

    setUserIDRoles(CheckUseridRoles)

    if (!checked) {
      setIsCheck(isCheck.filter(item => item !== id));
      setRoleCheck(roleCheck.filter(ids => ids !== data2));
    };
  }

  const RevokeUsers = e => {
     let bodyMsg = {};
      bodyMsg = {
        UserIds: isCheck,
        roles: roleCheck,
    
      }

    fetch('/api/acm/usersRole', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', RequestVerificationToken: document.getElementById(
          'RequestVerificationToken'
        ).value,
      },
      body: JSON.stringify(bodyMsg),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`)
        }
      })
      
      .then(() => {
        window.location.href = `/Role`
      })
    }


  // Initial states
  const [isEdit, setEdit] = useState(false);
  const [disable, setDisable] = useState(true);
  

  const handleEdit = (i) => {
    setEdit(!isEdit);
  };

  const handleSave = () => {
    setEdit(!isEdit);
    setDisable(true);
    let bodyMsg = {};
    bodyMsg = {
      UserIds: isCheck,
      roles: roleCheck,
      roleChange: selectedValue
    }

    fetch('/api/acm/AssignedUsersRole', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', RequestVerificationToken: document.getElementById(
          'RequestVerificationToken'
        ).value,
      },
      body: JSON.stringify(bodyMsg),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`)
        }
      })

      .then(() => {
        window.location.href = `/Role`
      })
  };

 
  const handleInputChange = (e) => {
    setDisable(false);
    setSelectedValue(e.target.value);
  };

  const canceledit = () => {
    setEdit(!isEdit);
    setSelectedValue()
  };


  const checkDuplicates = () => {
    for (let i = 0; i < UserIDRoles.length; i++) {
      if (UserIDRoles[i] === selectedValue) {
        return true; // Match found, return true
      }
    }
    return false; // No matches found
  };

  return (
    <>
      <div className="text-danger">
        {checkDuplicates() && <p>Error: Duplicate value found in the other list</p>}
      </div>

      {selectedValue == roleCheck && selectedValue != "" &&
        <p className="text-danger">User Role and role selected is the same !</p>
      }


    
    <div>
    
      <TopDiv>
          <LeftDiv>
     
              {isEdit ? (
                <div>
                  {filtercontext.result.length !== 0 && (
                  <div>
               
                    {checkDuplicates() || disable || selectedValue == roleCheck && selectedValue != "" ? (
               
                        <>
                        <Button disabled align="right" size="sm" variant="outline-primary mr-2" onClick={handleSave}>
                          Save
                        </Button>

                        <Button size="sm" onClick={canceledit}>
                              Cancel
                        </Button>

                        </>

                      ) : (
                        <>
                          <Button align="right" size="sm" variant="outline-primary mr-2"  onClick={handleSave}>
                            Save
                          </Button>

                          <Button size="sm" onClick={canceledit}>
                            Cancel
                          </Button>

                          </>
                      )}
                    </div>
                  )}
            </div>

          )

            : (
                <div>
                {isCheck.length > 0 ? (
                  <Button align="right" size="sm" className="mr-2 btn-success" onClick={handleEdit}>
                    Assign Role
                  </Button>) :

                  <Button disabled align="right" size="sm" className="mr-2 btn-success" >
                    Assign Role
                  </Button>}

                    {isCheck.length > 0 ? (
                  <Button align="right" size="sm" className="mr-2 btn-danger" onClick={RevokeUsers }>
                      Revoke Role
                      </Button>) :

                      <Button disabled align="right" size="sm" className="mr-2 btn-danger" >
                        Revoke Role
                  </Button>}

                  </div>
              )}
        </LeftDiv>
      </TopDiv>
   
    <div className="shadow bg-white rounded mt-3">
      <table className=" table table-striped table-borderless table-responsive-lg table-lg" width="100%" >
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={isCheckAll}
                />
              </th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col ">Department </th>
            <th scope="col ">Group </th>
            <th scope="col">Role</th>
            <th scope="col">Last Login Date</th>
            </tr>
          </thead>

          <tbody>
          {filtercontext.result.map((item, index) => (
            <tr key={index}>
              <td>
                {isCheck.length == 0 || rowindex == index || isCheckAll == true
                  ? (<input
                  type="checkbox"
                  id={item.id}
                    onChange={(event) => handleClick(index, event)}
                    checked={isCheck.includes(item.id) } 

                />
                ) :
                  <input
                    type="checkbox"
                    id={item.id}
                    onChange={handleClick}
                    checked={isCheck.includes(item.id)}
                    className="d-none"


                  />}
              </td>

              <td >{item.name}</td>
              <td >{item.email}</td>
              <td>{item.Department}</td>
              <td>{item.group}</td>

              {isEdit && item.id == isCheck && rowindex == index || isCheck.length > 1 && isCheckAll == true ? (
                <td padding="none">
    
                  <select id="mySelect" value={selectedValue} onChange={handleInputChange}>
                    <option value="">-- Select --</option>
                    {SelectRowOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  
                </td>) : (
                <td>{item.role}</td>
              )}
  
              {item.LastLoginDate != null ? (
                <td>{format(new Date(item.LastLoginDate), SHORT_DATE_FORMAT)}</td>) :
                <td></td>
              }
              </tr>
            ))}
        </tbody>
      </table>
    </div>
        </div>
   
    </>
  );
};

export default SelectTableComponent;
