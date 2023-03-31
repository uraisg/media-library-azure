
import Form from 'react-bootstrap/Form';
import { Button, Dropdown  } from 'react-bootstrap'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@linaria/react'

//import { useFilter } from './@/../../../ucm/components/Context'

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

  @media only screen and (max-width: 799px) {
      left: 0;
      position: static;
      margin-top: 1em;
  }
`

const SearchUser = () => {
  
  //const filterContext = useFilter()
  const [search, setSearch] = useState("")

  const handleSearch = (e) => {
    setSearch(e.target.value)
  }

 

  return (

    <TopDiv> <h3>Users </h3>
      <LeftDiv>
       
        
        <Button
          size="sm"
          className="btn-danger sm"
          variant=""
        >
          Suspend User
        </Button>

        <Button
          size="sm"
          className="btn-success ml-3 "
          variant=""
        >
          Activate User
        </Button>


      </LeftDiv>

      <RightDiv>


        <Form.Control
          type="search"
          placeholder="Search..."
          className="mr-2"
          value={search}
          onChange={handleSearch}
        //  onKeyPress={}
        />
        <Button
          size="sm"
          className="btn-light mr-4"
          variant=""
          //onClick={() => handleSearchBtn()}
  
        >
          Search
        </Button>



        <Dropdown>
          <Dropdown.Toggle
            id="dropdown-date-filter"
            size="sm"
            variant="outline-primary"
             className=" mr-4"
          >
            Filter By:
          </Dropdown.Toggle>


          <Dropdown.Menu>
       
            <Dropdown.Item
              className="sortDropDown ">
              Department
            </Dropdown.Item>
            <Dropdown.Item>
              Status
            </Dropdown.Item>
            <Dropdown.Item>
              Last Login Date
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </RightDiv>

  
      </TopDiv>
  )
}

export default SearchUser
