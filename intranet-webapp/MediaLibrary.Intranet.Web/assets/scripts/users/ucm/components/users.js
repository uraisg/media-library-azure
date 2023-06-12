import { React } from "react";
import { useState } from "react";
import { useFilter } from './@/../../../ucm/components/context'
import { Button } from 'react-bootstrap'
import { styled } from '@linaria/react'
import { format } from 'date-fns'

const getColor = (user) => {
  if (user === "Active") return 'green';
  if (user === "Inactive") return 'orange';
  if (user === "Suspended") return "red";
  return '';
};

const TopDiv = styled.div`
  display: relative;
  @media only screen and (max-width: 799px) {
      display: block
  }
`

const LeftDiv = styled.div`
  display: inline-block;
  width: 60%;
  margin-top:1em;
 
`

const SelectTableComponent = () => {
  const filtercontext = useFilter()
  const SHORT_DATE_FORMAT = 'dd/MM/yyyy'

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  
  const handleSelectAll = e => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(filtercontext.result.map(li => li.id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };


  const [statusCheck, setStatusCheck] = useState("");
  const handleCheckboxChange = (itemId) => {
    const { id, checked } = itemId.target;
    setIsCheck([...isCheck, id]);

    const updatedData = filtercontext.result.map(item => {
      if (item.id == id) {
        setStatusCheck(item.Status)
      }
    });

    if (!checked) {
      setIsCheck(isCheck.filter(item => item !== id));
    }
  };

  const activateUser = (e) => {
    let bodyMsg = {};
    if (e.currentTarget.id == "activateButton") {
      bodyMsg = {
        UserIds: isCheck,
        UserStatus: "Active"
      }
    }
    else if (e.currentTarget.id == "suspendButton"){
      bodyMsg = {
        UserIds: isCheck,
        UserStatus: "Suspended"
      }
    }
   
    fetch('/api/acm/users', {
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
        window.location.href = `/Users`
      })
  };


  return (
    <div>
      <TopDiv>
        <LeftDiv>
          <div>

            {isCheck.length > 0 && statusCheck != "Active" ? (
              <Button align="right" size="sm" id="activateButton" className="mr-2 btn-success" onClick={activateUser}>
                Activate User
              </Button>) :

              <Button disabled align="right" size="sm" className="mr-2 btn-success" >
                Activate User
              </Button>}

            {isCheck.length > 0 && statusCheck !="Suspended" ? (
              <Button align="right" size="sm" id="suspendButton" className="mr-2 btn-danger" onClick={activateUser} >
                Suspend User
              </Button>) :

              <Button disabled align="right" size="sm" className="mr-2 btn-danger" >
                Suspend User
              </Button>}

            </div>
        </LeftDiv>
   </TopDiv>
    <div className="shadow bg-white rounded mt-4">

      <table className=" table table-striped table-borderless table-responsive-lg table-lg"
        width="100%" >
          <thead>
            <tr>
              <th scope="col">
   
                
                  {( isCheck.length == 0 ) ? (
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={isCheckAll}
                      className="d-none"
                    />

                  )
                    :
                    <input
                      type="checkbox"
                      onChange={handleSelectAll}
                      checked={isCheckAll}
                    />
                  }      
              </th>
            <th scope="col">
              Name
            </th>
            <th scope="col">Email</th>
            <th scope="col ">Department </th>
            <th scope="col ">Group </th>
            <th scope="col">Status</th>
            <th scope="col">Last Login Date</th>
            <th scope="col">Suspended Date</th>
            </tr>
          </thead>

          <tbody>

          {filtercontext.result.map((item, index) => (
            <tr key={index}>
            
              <td>
                {(item.Status == "Inactive" || isCheck.length > 0 && item.Status != statusCheck) ? (
                    <input
                    type="checkbox"
                    id={item.id}
                    onChange={handleCheckboxChange}
                    checked={isCheck.includes(item.id)}
                    className="d-none"
                  />
              
                )
                  :
                  <input
                    type="checkbox"
                    id={item.id}
                    onChange={handleCheckboxChange}
                    checked={isCheck.includes(item.id)}
                  />
            }               
                </td>
                <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.Department}</td>
                <td>{item.group}</td>
                <td style={{ color: getColor(item.Status) }}>{item.Status}</td>
            
              {item.LastLoginDate != null ? (
                <td>{format(new Date(item.LastLoginDate), SHORT_DATE_FORMAT)}</td>) :
                <td></td>
              }
              {item.DisableDate != null ? (
                <td>{format(new Date(item.DisableDate), SHORT_DATE_FORMAT)}</td>):
                <td></td>
                }

              </tr>

            ))}
        
        </tbody>
      </table>

    </div>
    </div>
  );

};

export default SelectTableComponent;
