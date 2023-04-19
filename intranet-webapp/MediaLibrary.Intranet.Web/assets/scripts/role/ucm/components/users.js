import { React } from "react";
import { useState } from "react";
import { useFilter } from './@/../../../ucm/components/context'
import { Button } from 'react-bootstrap'
import { Editbutton } from './@/../../../ucm/components/searchuser'
import { styled } from '@linaria/react'

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
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);

  const handleSelectAll = e => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(filtercontext.result.map(li => li.id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const handleClick = e => {
    const { id, checked } = e.target;
    console.log(id)
    setIsCheck([...isCheck, id]);
    setIsShown(current => !current);
    if (!checked) {
      setIsCheck(isCheck.filter(item => item !== id));
    }
  };

  const [show, setIsShown] = useState(false);

  // Initial states
  const [isEdit, setEdit] = useState(false);
  const [disable, setDisable] = useState(true);

  const handleEdit = (i) => {
    setEdit(!isEdit);
  };

  // Function to handle save
  const handleSave = () => {
    setEdit(!isEdit);
    setDisable(true);
  };

  const handleInputChange = (e, index) => {
    setDisable(false);
    const { name, value } = e.target;
    const list = [...filtercontext.result];
    console.log(name)
    console.log(value)
    console.log(index)
    list[index][name] = value;
    filtercontext.setResult(list);
  };

  // Showing cancel the edit 
  const canceledit = () => {
    setEdit(!isEdit);
  };

  return (
    <div>
      
      <TopDiv>
        <LeftDiv>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              {isEdit ? (
                <div>
                  {filtercontext.result.length !== 0 && (
                    <div>
                      {disable ? (
                        <Button disabled align="right" size="sm" variant="outline-primary" onClick={handleSave}>

                          SAVE
                        </Button>
                      ) : (
                          <Button align="right" size="sm" variant="outline-primary"  onClick={handleSave}>
                          SAVE
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <Button align="right" size="sm" className="mr-2"
                    variant="outline-primary" onClick={handleEdit}>
                    EDIT
                  </Button>
                    {isCheck.length > 1 ? (
                      <Editbutton />
                    ) : null}
                  </div>

              )}
            </div>
          </div>
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
            <th scope="col">Permission</th>
            <th scope="col">Last Login Date</th>
            </tr>
          </thead>

          <tbody>
          {filtercontext.result.map((item, index) => (
            <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    id={item.id}
                    onChange={handleClick}
                    checked={isCheck.includes(item.id)}
                  />
                </td>

              <td >{item.name}</td>
              <td >{item.email}</td>
              <td>{item.Department}</td>
              <td>{item.Group}</td>
              {isEdit ? (
                <td padding="none">
                  <select
                    style={{ width: "100px" }}
                    name="role"
                    value={item.role}
                    onChange={(e) => handleInputChange(e, index)}
                  >
                    <option value=""></option>
                    <option value="User">User</option>
                    <option value="SystemAdmin">System Admin</option>
                    <option value="RoleAdmin">Role Admin</option>
                  </select>
                </td>) : (
                <td>{item.role}</td>
              )}
              {isEdit ? (
                <td padding="none">
                  <select
                    style={{ width: "100px" }}
                    name="permission"
                    value={item.permission}
                    onChange={(e) => handleInputChange(e, index)}
                  >
                    <option value=""></option>
                    <option value="Regular">Regular</option>
                    <option value="Restricted">Restricted</option>
                  </select>
                </td>) : (
                <td>{item.permission}</td>
              )}
              <td>{item.LastLoginDate}</td>
              <td>
                {isEdit ? (
                  <Button size="sm" onClick={canceledit}>
                  Cancel
                </Button>
              ) : null}
                 </td>
          
              </tr>
            ))}
        </tbody>
      </table>
    </div>
    </div>
  );
};

export default SelectTableComponent;
