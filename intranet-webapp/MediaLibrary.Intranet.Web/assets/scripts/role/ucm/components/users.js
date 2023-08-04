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
    position: 'absolute',
    zIndex: 4, 
  }),

};



const SelectTableComponent = () => {
  const filtercontext = useFilter()
  const SHORT_DATE_FORMAT = 'dd/MM/yyyy'
  const [SelectRowOptions, setSelectedRoleOptions] = useState([])

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

  const [UserIDRoles, setUserIDRoles] = useState([])

  const [AddRole, setAddrole] = useState([])
  
  const [isCheckUser, setIsCheckUser] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAllChange = (event) => {
    setSelectAll(!selectAll);
    setIsCheckUser(AddRole.map(li => li.role));

    if (selectAll) {
      setIsCheckUser([]);
      }

    };

  const handleClickUser = (userid) => {
    const { id, checked } = userid.target;
    setIsCheckUser([...isCheckUser, id]);

    if (!checked) {
      setIsCheckUser(isCheckUser.filter(item => item !== id));
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


  const handleClick = (itemId) => {
    const { id, checked } = itemId.target;
    setIsCheck([...isCheck, id]);
    const Roledata = totalUsers.filter((role) => role.id.includes(id));
    setAddrole(Roledata)
    filtercontext.setDisableSearch(true)


    if (!checked) {
      setIsCheck(isCheck.filter(item => item !== id));
      setAddrole(AddRole.filter((role) => !role.id.includes(id)));
   
    };
  }
 
  const RevokeUsers = e => {
     let bodyMsg = {};
      bodyMsg = {
        UserIds: isCheck,
        roles: isCheckUser,
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

  const [disable, setDisable] = useState(true);
  const [isAdd, setAdd] = useState(false);

  const handleAdd = (i) => {
    setAdd(!isAdd);
    const filteredData = totalUsers.filter((i) => i.id.includes(isCheck));
    console.log(filteredData)
    const CheckUseridRoles = filteredData.map((items) => items.role);
    setUserIDRoles(CheckUseridRoles)
  };
  
  const handleSave = () => {
    setDisable(true);
    let bodyMsg = {};

    bodyMsg = {
      UserIds: isCheck,
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
  const handleCancel = () => {
    setIsCheck([])
    setAddrole([])
    setIsCheckUser([])
    setAdd(false)
    filtercontext.setDisableSearch(false)
  }

  const [userNewRole, setUserNewRole] = useState([])
  const handleaddrole = (newSelectedOptions) => {
  setUserNewRole(newSelectedOptions.map((o) => o.value));
  setDisable(false);
  };

  const renderTable = () => {
    const renderedIds = [];
    return (
      
      <div>

        {AddRole.map((userrole, index) => {
          if (!renderedIds.includes(userrole.id)) {
            renderedIds.push(userrole.id);

            return (

              <div key={index} className="alignpar">
                <p className="font-weight-bold ">Name: {userrole.name}</p>
                <p>Email: {userrole.email}</p>
                <p>Group: {userrole.group}</p>
                <p>Department: {userrole.Department}</p>
              </div>

            );
          }
        })
        }
        <hr></hr>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="sm" className="mr-2 btn-success mt-3" onClick={handleAdd} >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
          </svg></Button>
          {isCheckUser.length > 0 ? (
          <>

              <Button align="left" size="sm" className="mr-2 mt-3 btn-danger" onClick={RevokeUsers}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash-lg" viewBox="0 0 16 16">
                  <path d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z" />
                </svg>
              </Button>
            </>
          ) :

            <>

              <Button disabled align="left" size="sm" className="mr-2 mt-3 btn-danger"
                onClick={RevokeUsers}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-dash-lg" viewBox="0 0 16 16">
                  <path d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z" />
                </svg>
              </Button>
            </>
          }

       
        </div>
        

        <table className="roletable" >
        <thead >
            <tr>
              <th>
                <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAllChange}
                />
              </th>

              <th >Role</th>

          </tr>
        </thead>

        <tbody>
          {AddRole.map((userrole, index) => {

            return (
       
                <tr key={index} >
                  <td >
                   <input
                        type="checkbox"
                        id={userrole.role}
                      onChange={(event) => handleClickUser(event)}
                      checked={isCheckUser.includes(userrole.role)}

                      />
              
                          
                  </td>
                  <td>{userrole.role}</td>

                </tr>
                 
              );

          })
            }
          
        </tbody>
        </table>
        {isAdd &&
          <table className="rowalign">
            <thead>
              <tr>
                <th colSpan="3">
                  Select roles to assign 
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
                      .filter((e1) => !UserIDRoles.includes(e1) )
                 
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


        {disable || userNewRole == "" ? (

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
     
      <div>

        <TopDiv>
          <LeftDiv></LeftDiv>
        </TopDiv>



       
        <div className="shadow bg-white rounded mt-3">
        {isCheck.length == 0 ? (
        
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
                    onChange={(event) => handleClick(event)}
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
                <td>{item.role}</td>
             
  
              {item.LastLoginDate != null ? (
                <td>{format(new Date(item.LastLoginDate), SHORT_DATE_FORMAT)}</td>) :
                <td></td>
              }
              </tr>
            ))}

        </tbody>
            </table>
) :

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
