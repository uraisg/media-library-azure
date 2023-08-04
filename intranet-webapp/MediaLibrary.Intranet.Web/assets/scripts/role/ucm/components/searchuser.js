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


const RightDiv = styled.div`
  display: inline-flex;
  margin-top: -0.8em;
    right: 0;
  position: absolute;
  margin-right:4.2em;

  @media only screen and (max-width: 799px) {
    left: 0;
    position: static;
    margin-top: 1em;
    display: inline;
  }
`

export const SearchUser = () => {

  const filterContext = useFilter()

  const [search, setSearch] = useState("")
  const sortOption = ["dateDSC", "dateASC","RoleASC","RoleDSC","groupASC", "groupDSC", "departmentDSC", "departmentASC"]

  const handleSort = (option) => {
    filterContext.setResult([])
    const temp = { ...filterContext.active, "SortOption": option }
    filterContext.setActive(temp)
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
  }

  const [isShown, setIsShown] = useState(false);

  const handleClick = event => {
    setIsShown(current => !current);
  };

  const downloadUserRolesReport = () => {
    const baseLocation = location
    let url = new URL('/api/acm/generateUserRoleReport', baseLocation)
    url.search = new URLSearchParams(filterContext.active)

    fetch(url, {
      mode: 'same-origin',
      credentials: 'same-origin',
    })
      .then(response => response.blob())
      .then(blob => {
        // Create a download link
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = 'ML_UserRoleReport';

        // Simulate a click on the download link
        downloadLink.click();

        // Clean up
        URL.revokeObjectURL(downloadLink.href);
      })
      .catch(error => {
        console.error(error);
      });
  }
  return (

    <TopDiv>
      <h3 className="mt-2">User Role</h3>
     
      <RightDiv>
        <InputGroup className="mr-2">
          <Form.Control
            type="search"
            placeholder="Enter email here..."
            value={search}
            disabled={filterContext.disablesearch}
            onChange={handleSearch}
            onKeyPress={handleEnterSearch} />

          <InputGroup.Append>
            <Button onClick={() => handleSearchBtn()} disabled={filterContext.disablesearch}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
              </svg>
            </Button>
          </InputGroup.Append>
        </InputGroup>

        <Dropdown>
          <Dropdown.Toggle className="border border-primary mr-2" variant="" size="s" disabled={filterContext.disablesearch}>
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
          size="sm" disabled={filterContext.disablesearch}
          variant="outline-primary"
          className="mr-2" >
          Filter
        </Button>

        <Button size="sm" variant="outline-primary" className="mr-2"
          onClick={downloadUserRolesReport} disabled={filterContext.disablesearch}
        >
          Download
        </Button>
      </RightDiv>
      {isShown ? (
          <Filteruser />
      ) : null}

    </TopDiv>


  )
}


