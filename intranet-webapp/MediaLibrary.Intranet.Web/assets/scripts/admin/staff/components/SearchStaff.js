import styled from 'styled-components'
import Form from 'react-bootstrap/Form';
import { Button, Dropdown } from 'react-bootstrap'
import { useState } from 'react'
import { ArrowClockwise } from 'react-bootstrap-icons'

import { convertSort } from './@/../../../Layout/Functions'
import { useFilter } from './@/../../../staff/components/Context'

const TopDiv = styled.div`
  display: flex;

  @media only screen and (max-width: 799px) {
      display: block
  }
`

const LeftDiv = styled.div`
  display: flex;
  width: 60%;
`

const RightDiv = styled.div`
  display: flex;
  margin-top: 0.2em;
  right: 0;
  position: absolute;

  @media only screen and (max-width: 799px) {
      left: 0;
      position: static;
      margin-top: 1em;
  }
`

const SearchStaff = () => {
  const filterContext = useFilter()
  const sortOption = ["uploadDSC", "uploadASC", "downloadDSC", "downloadASC"]
  const [search, setSearch] = useState("")

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

  const handleSort = (option) => {
    const temp = { ...filterContext.active, "SortOption": option }
    filterContext.setActive(temp)
  }

  const handleRefresh = () => {
    filterContext.setResult([])
    filterContext.setActive({
      Page: 1,
      SearchQuery: "",
      SortOption: "uploadDSC"
    })
  }

  return (
    <TopDiv>
      <LeftDiv>
        <Form.Control
          type="search"
          placeholder="Enter email here (e.g. p_y, p_y@example.com)"
          className="mr-1"
          value={search}
          onChange={handleSearch}
          onKeyPress={handleEnterSearch}
        />
        <Button
          size="sm"
          className="searchBtn"
          variant=""
          onClick={() => handleSearchBtn()}
        >
          Search
        </Button>
      </LeftDiv>

      <RightDiv>
        <Dropdown>
          <Dropdown.Toggle className="border border-primary mr-2" variant="" size="sm">
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
        <a
          className="ml-1 mt-1"
          onClick={() => handleRefresh()}
        >
          <ArrowClockwise
            size={20}
            className="mr-4"
          />
        </a>
      </RightDiv>
    </TopDiv>
  )
}

export default SearchStaff
