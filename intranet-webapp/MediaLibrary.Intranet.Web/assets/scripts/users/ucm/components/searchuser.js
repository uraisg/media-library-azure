
import Form from 'react-bootstrap/Form';
import { Button, Dropdown  } from 'react-bootstrap'
import { useState } from 'react'
import { styled } from '@linaria/react'
import DatePickerRange from './@/../../../ucm/components/DatePickerRange'


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

  const [isShown, setIsShown] = useState(false);

  const handleClick = event => {
    // 👇️ toggle shown state
    setIsShown(current => !current);
  };

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
          className="btn-primary mr-4"
          variant=""
        //onClick={() => handleSearchBtn()}
        >
          Search
        </Button>

          <Button onClick={handleClick}
          size="sm"
          variant="outline-primary"
          className=" mr-4" >
          Filter
          </Button>


      </RightDiv>
      {isShown ? (
        <div className="shadow bg-white rounded mt-4">
  
          <table className=" table table-borderless table-responsive-lg table-sm">
            <tbody>
          
            <tr>
                <th className="col-md-2" >Department</th>
                <td>   <Dropdown>
                  <Dropdown.Toggle
                    id="dropdown-date-filter"
                    size="sm"
                    variant="outline-primary"
                    className=" ml-4"
                  >
                    Filter By:
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item
                      className="sortDropDown ">
                      ISGG1
                    </Dropdown.Item>
                    <Dropdown.Item>
                      ISGG2
                    </Dropdown.Item>
                    <Dropdown.Item>
                      ISGG3
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown></td>
          
            </tr>


              <tr>
                <th className="col-md-2" >Status</th>
                <td >   <Dropdown>
              <Dropdown.Toggle
                id="dropdown-date-filter"
                size="sm"
                variant="outline-primary"
                className=" ml-4"
              >
                Filter By:
              </Dropdown.Toggle>


              <Dropdown.Menu>
                <Dropdown.Item
                  className="sortDropDown ">
                  Active
                </Dropdown.Item>
                <Dropdown.Item>
                  Inactive
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown></td>
              </tr>

              <tr>
                <th className="col-md-2">Last Login Date</th>
                <td className="col-12 col-md-8">
                  <DatePickerRange /> </td>
                <td>
                  <Button size="s"
                    className="btn btn-primary ">
                  Search
                </Button></td>
              </tr>

            </tbody>
          </table>
        </div>
      ) : null}
  
    </TopDiv>

  )
}

export default SearchUser
