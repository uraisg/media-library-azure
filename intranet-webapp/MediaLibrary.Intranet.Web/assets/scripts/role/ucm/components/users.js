import  React from "react";
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

  const [isCheck, setIsCheck] = useState([]);

  const [roleCheck, setRoleCheck] = useState([]);
  const [rowindex, SetrowIndex] = useState()
 
  const [UserIDRoles, setUserIDRoles] = useState([])

  const [AddRole, setAddrole] = useState([])
  
  const [isCheckUser, setIsCheckUser] = useState([]);

  const handleClickUser = (index, userid) => {
    const { id, checked } = userid.target;
    SetrowIndex(index)
    setIsCheckUser([...isCheckUser, id]);
 
    const userrowcheck = AddRole[index].role

    const filteredData = totalUsers.filter((i) => i.id.includes(id) && i.role !== userrowcheck);

    const CheckUseridRoles = filteredData.map((items) => items.role);

    setUserIDRoles(CheckUseridRoles)
    setRoleCheck([...roleCheck, userrowcheck]);

    if (!checked) {
      setIsCheckUser(isCheckUser.filter(item => item !== id));
      setRoleCheck(roleCheck.filter(ids => ids !== userrowcheck));
      setUserIDRoles([]);
      setAdd(false)
      setEdit(false)
    };
  }

  const [totalUsers, setTotalUsers] = useState([]);

  useEffect(() => {
    const baseLocation = location
    let url = new URL('/api/acm/getAllUsersRoles', baseLocation)
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
        handleResult(result)

      })

    const handleResult = (data) => {
      let allResult = []
      data.forEach((item) => {

        const resultItem = {

          id: item.id,
          name: item.name,
          email: item.email,
          Department: item.department,
          group: item.group,
          role: item.role,
          LastLoginDate: item.LastLoginDate,

        }
        allResult.push(resultItem)
      })

      setTotalUsers(allResult)
    }
  }, [filtercontext.active])


  const handleClick = (index, itemId) => {
    const { id, checked } = itemId.target;
    setIsCheck([...isCheck, id]);
    const Roledata = totalUsers.filter((role) => role.id.includes(id));
    setAddrole(Roledata)


    if (!checked) {
      setIsCheck(isCheck.filter(item => item !== id));
      setAddrole(AddRole.filter((role) => !role.id.includes(id)));
   
    };
  }
 
  const RevokeUsers = e => {
     let bodyMsg = {};
      bodyMsg = {
        UserIds: isCheck,
        roles: roleCheck,
      }

    fetch('/api/acm/usersRole', {
      method: 'DELETE',
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


  const [isEdit, setEdit] = useState(false);
  const [disable, setDisable] = useState(true);


  const [isAdd, setAdd] = useState(false);

  const handleAdd = (i) => {
    setAdd(!isAdd);
  };

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
      roleChange: selectedValue,
      addrole: userNewRole
    }

    fetch('/api/acm/EditUsersRole', {
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

  const checkDuplicates = () => {
    for (let i = 0; i < UserIDRoles.length; i++) {
      if (UserIDRoles[i] === selectedValue) {
        return true; 
      }
    }
    return false; 
  };

  const handleCancel = () => {
    setIsCheck([])
    setRoleCheck([])
    setAddrole([])
    setIsCheckUser([])
    setAdd(false)
  }


  //to add new role for users the dropdown select 
  const [userNewRole, setUserNewRole] = useState([])
  const handleaddrole = (newSelectedOptions) => {
  setUserNewRole(newSelectedOptions.map((o) => o.value));
  setDisable(false);
  };

  const renderTable = () => {
    const renderedIds = [];
    return (
      <div>

        <div>
          {isCheckUser.length > 0 ? (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button size="sm" className="ml-2 btn-success mt-3" onClick={handleEdit}>Edit User Role</Button>
               <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="sm" className="mr-2 btn-success mt-3" onClick={handleAdd} >Add User Role</Button>
            <Button align="left" size="sm" className="mr-2 mt-3 btn-danger" onClick={RevokeUsers}>Revoke User Role</Button>
              </div>
            </div>
          ) :
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button disabled size="sm" className="ml-2 btn-success mt-3" onClick={handleEdit}>Edit User Role</Button>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button disabled size="sm" className="mr-2 btn-success mt-3" onClick={handleAdd} >Add User Role</Button>
              <Button disabled align="left" size="sm" className="mr-2 mt-3 btn-danger" onClick={RevokeUsers}>Revoke User Role </Button>
            </div>
            </div>
          }
        </div>

        <table className=" table table-striped  table-bordered table-responsive-lg table-lg mt-3" width="100%" >
        <thead >
          <tr>
          <th></th>
            <th scope="col">Name</th>
            <th scope="col">Email</th>
            <th scope="col ">Department </th>
            <th scope="col ">Group </th>
            <th scope="col">Role</th>

          </tr>
        </thead>

        <tbody>
          {AddRole.map((userrole, index) => {
            if (!renderedIds.includes(userrole.id)) {
              renderedIds.push(userrole.id);
              return (
            
                  <tr key={index}>
                      <td>
                          {isCheckUser.length == 0 || rowindex == index
                              ? (<input
                                  type="checkbox"
                                  id={userrole.id}
                                  onChange={(event) => handleClickUser(index, event)}
                                  checked={isCheckUser.includes(userrole.id)} />
                              ) :
                              <input
                                  type="checkbox"
                                  id={userrole.id}
                                  onChange={handleClickUser}
                                  checked={isCheckUser.includes(userrole.id)}
                                  className="d-none" />}
                      </td>
                      <td>{userrole.name}</td>
                      <td>{userrole.email}</td>
                      <td>{userrole.group}</td>
                      <td>{userrole.Department}</td>
                      {isEdit && isCheckUser == userrole.id && rowindex == index ? (
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
                          <td>{userrole.role}</td>
                      )}
                </tr>

              );
            } else {
              return (
                <React.Fragment key={index}>
                <tr >
                  <td>
                    {isCheckUser.length == 0 || rowindex == index
                      ? (<input
                        type="checkbox"
                        id={userrole.id}
                        onChange={(event) => handleClickUser(index, event)}
                        checked={isCheckUser.includes(userrole.id)}

                      />
                      ) :
                      <input
                        type="checkbox"
                        id={userrole.id}
                        onChange={handleClickUser}
                        checked={isCheckUser.includes(userrole.id)}
                        className="d-none"
                      />}
                  </td>

                  <td ></td>
                  <td ></td>
                  <td></td>
                    <td></td>

                  {isEdit && isCheckUser == userrole.id && rowindex == index ? (
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
                      <td>{userrole.role}</td>
                    )}
                </tr>
                </React.Fragment>
              );
            }
          })
            }
          
        </tbody>
        </table>
        {isAdd && isCheckUser.length >0 &&
          <table>
            <thead>
              <tr>
                <th colSpan="3">
                  Select roles to assign to {isCheckUser}
                </th>
              </tr>

            </thead>
            <tbody>
              <tr >

                <td>Roles</td>
                <td>
                  <Select styles={customStyles} onChange={handleaddrole}
                    isMulti 

                    options={SelectRowOptions
                      .filter((e1) => e1 != roleCheck && !UserIDRoles.includes(e1) )
                 
                      .map((e1) => ({
                        value: e1,
                        label: e1,
                      }))
                    }

                  />
                </td>
              </tr>
            </tbody >
          </table>}


        {checkDuplicates() || disable || selectedValue == roleCheck && selectedValue != "" || isCheckUser.length == 0 ? (

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="sm" disabled className=" mr-2 mb-2 btn btn-primary" onClick={handleSave}>Save</Button>
            <Button size="sm" variant="outline-primary" className="mr-2 mb-2" onClick={handleCancel}>Cancel</Button>

          </div>

        ) : (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="sm" className=" mr-2 mb-2 btn btn-primary" onClick={handleSave}>Save</Button>
              <Button size="sm" variant="outline-primary" className="mr-2  mb-2" onClick={handleCancel}>Cancel</Button>

          </div>
        )}
      </div>
    )
  }
           

  
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
          </LeftDiv>
        </TopDiv>
   
        <div className="shadow bg-white rounded mt-3">

          {isCheck.length == 0  ? (
      <table className=" table table-striped table-borderless table-responsive-lg table-lg" width="100%" >
          <thead>
            <tr>
            <th></th>
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
                {isCheck.length == 0 || rowindex == index
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

              {isEdit && item.id == isCheck && rowindex == index  ? (
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
            </table>) :

            <div>

              {renderTable()}
            </div>
          }



    </div>
        </div>
   
    </>
  );
};

export default SelectTableComponent;
