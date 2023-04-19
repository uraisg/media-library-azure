import { Button, Dropdown, Modal } from 'react-bootstrap'
import { useState } from 'react'
import { styled } from '@linaria/react'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { useFilter } from './@/../../../ucm/components/context'
import { Filteruser }  from './@/../../../ucm/components/Dropdown'
import { convertSort } from './@/../../../ucm/components/sort'

const TopDiv = styled.div`
  display: relative;
  @media only screen and (max-width: 799px) {
    display: block
  }
`

const LeftDiv = styled.div`
  display: inline-block;
  width: 60%;
`

const RightDiv = styled.div`
  display: inline-flex;
  margin-top: 0.2em;
  right: 0;
  position: absolute;
  margin-right:4.2em;

  @media only screen and (max-width: 799px) {
    left: 0;
    position: static;
    margin-top: 1em;
    display: inline-flex;
  }
`

export const SearchUser = () => {
  const filterContext = useFilter()
  const [search, setSearch] = useState("")
  const sortOption = ["dateDSC", "dateASC","RoleASC","RoleDSC","GroupASC", "GroupDSC", "PermissionASC","permissionDSC", "departmentDSC", "departmentASC"]

  const handleSort = (option) => {
    filterContext.setResult([])
    const temp = { ...filterContext.active, "SortOption": option }
    filterContext.setActive(temp)
    filterContext.callapi()
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

  const handleEnterSearch = (e) => {
    if (e.keyCode == 13 || e.key === "Enter") {
      const temp = { ...filterContext.active, "SearchQuery": search }
      filterContext.setActive(temp)
    }
  }

  const handleSearchBtn = () => {
    const temp = { ...filterContext.active, "SearchQuery": search }
    filterContext.setActive(temp)
    filterContext.callapi()
  }

  const [isShown, setIsShown] = useState(false);

  const handleClick = event => {
    // 👇️ toggle shown state
    setIsShown(current => !current);
  };

  return (

    <TopDiv>
      <h3>User Role</h3>
      <LeftDiv></LeftDiv>
      <RightDiv>
        <InputGroup className="mr-2">
          <Form.Control
            type="search"
            placeholder="Enter email here..."
            value={search}
            onChange={handleSearch}
            onKeyPress={handleEnterSearch} />

          <InputGroup.Append>
            <Button onClick={() => handleSearchBtn()}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </Button>
          </InputGroup.Append>
        </InputGroup>

        <Dropdown>
          <Dropdown.Toggle className="border border-primary mr-2" size="s">
            Sort By: {convertSort(filterContext.active.SortOption)}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {sortOption.map((item, index) => (
              <Dropdown.Item
                className="sortDropDown"
                key={index}
                style={item == filterContext.active.SortOption ? { backgroundColor: "rgb(227, 230, 228)" } : {}}
                onClick={() => handleSort(item)}
              >
                {convertSort(item)}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        <Button onClick={handleClick}
          size="sm"
          variant="outline-primary"
          className="mr-2" >
          Filter
        </Button>

        <Button onClick={handleClick}
          size="sm"
          variant="outline-primary"
          className="mr-2" >
          Download 
        </Button>
      </RightDiv>
      {isShown ? (
          <Filteruser />
      ) : null}
  
    </TopDiv>
  )
}

export const Editbutton = () => {
  const [showModal, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
    <Button onClick={handleShow} size="sm" variant="outline-primary">
        Edit Users
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pen" viewBox="0 0 16 16">
        <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001zm-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708l-1.585-1.585z" />
    </svg>
    </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Body>
          <table>
          <tbody>
            <tr>
            <td>
              <b>Role : </b></td>
              <select
                style={{ width: "200px" }}>
                <option value=""></option>
                <option value="User">User</option>
                <option value="SystemAdmin">System Admin</option>
                <option value="RoleAdmin">Role Admin</option>
              </select>
            </tr>
            <tr>
              <td className="pr-2">
                <b>Permission: </b></td>
              <select
                style={{ width: "200px" }}>
                <option value=""></option>
                <option value="Regular">Regular</option>
                <option value="Restricted">Restricted</option>
              </select>
            </tr>
          </tbody>
          </table>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Edit
          </Button>
        </Modal.Footer>
          </Modal>
        </>
  )
}
