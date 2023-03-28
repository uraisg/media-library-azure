import { Dropdown, Form, InputGroup, Button } from 'react-bootstrap'
import { ArrowClockwise } from 'react-bootstrap-icons'
import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { parseISO } from 'date-fns'

import { useFilter } from './@/../../../filereport/components/Context'
import { convertSort } from './@/../../../Layout/Functions'

const FilterDiv = styled.div`
  display: flex;

  @media only screen and (max-width: 899px) {
      display: inline;
  }
`

const FilterRight = styled.div`
  justify-content: end;
  width: 100%;
  display: flex;

  @media only screen and (max-width: 899px) {
    justify-content: left;
    margin-block: 2%;
  }
`

const parseAndFormatDate = (date) => {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('default', options).format(parseISO(date))
}


const FilterOptions = () => {
  const filterContext = useFilter()

  const sortOption = ["dateDSC", "dateASC", "fileSizeASC", "fileSizeDSC", "viewStatsASC", "viewStatsDSC", "downloadStatsASC", "downloadStatsDSC"]

  const [date, setDate] = useState({"StartDate": "", "EndDate": ""})

  const handleRefresh = () => {
    filterContext.setResult([])
    filterContext.setActive({ ...filterContext.active })
  }

  const handleSort = (option) => {
    filterContext.setResult([])
    const temp = { ...filterContext.active, "SortOption": option }
    filterContext.setActive(temp)
  }

  const handleStartDate = (e) => {
    const temp = { ...date, "StartDate": e.target.value }
    setDate(temp)
  }

  const handleEndDate = (e) => {
    const temp = { ...date, "EndDate": e.target.value }
    setDate(temp)
  }

  const handleResetDate = () => {
    filterContext.setResult([])
    setDate({ "StartDate": "", "EndDate": "" })
    const temp = { ...filterContext.active, "StartDate": "", "EndDate": "" }
    filterContext.setActive(temp)
  }

  const handlePlanningArea = (area) => {
    filterContext.setResult([])
    const temp = { ...filterContext.active, "PlanningArea": area }
    filterContext.setActive(temp)
  }

  useEffect(() => {
    if (date.StartDate != "" && date.EndDate != "") {
      filterContext.setResult([])
      const temp = { ...filterContext.active, "StartDate": date.StartDate, "EndDate": date.EndDate }
      filterContext.setActive(temp)
    }
  }, [date])

  return (
    <React.Fragment>
      {date.StartDate == "" && date.EndDate != "" &&
        <p className="text-danger">Please select starting date</p>
      }

      {date.StartDate != "" && date.EndDate == "" &&
        <p className="text-danger">Please select ending date</p>
      }

      <FilterDiv>
        <Dropdown>
          <Dropdown.Toggle className="border border-primary mr-2" variant="" size="sm">
            Planning Area: {filterContext.active.PlanningArea}
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{ height: "350px", overflow: "auto" }}
          >
            <Dropdown.Item
              style={filterContext.active.PlanningArea == "ALL" ? { backgroundColor: "rgb(227, 230, 228)" } : { backgroundColor: "white" }}
              onClick={() => handlePlanningArea("ALL")}
            >
              ALL
            </Dropdown.Item>
            <Dropdown.Divider />

            {filterContext.area.map((item, key) => (
              <React.Fragment key={key}>
                <h6 className="ml-2">{item.Region}</h6>

                {item.PlanningArea.map((pArea, index) => (
                  <Dropdown.Item
                    key={index}
                    style={filterContext.active.PlanningArea == pArea ? { backgroundColor: "rgb(227, 230, 228)" } : { backgroundColor: "white" }}
                    onClick={() => handlePlanningArea(pArea)}
                  >
                    {pArea}
                  </Dropdown.Item>
                ))}

              </React.Fragment>
            ))}

          </Dropdown.Menu>
        </Dropdown>

        <Dropdown>
          <Dropdown.Toggle className="border border-primary" variant="" size="sm">
            Date Period: {filterContext.active.StartDate == "" || filterContext.active.EndDate == "" ? "Any Time" : `${parseAndFormatDate(filterContext.active.StartDate)} to ${parseAndFormatDate(filterContext.active.EndDate)}`}
          </Dropdown.Toggle>

          <Dropdown.Menu
            style={{ width: '300px', padding: '10px' }}
          >
            <Form.Group>
              <InputGroup>
                <InputGroup.Text className="filter-date-text">From</InputGroup.Text>
                <Form.Control
                  type="date"
                  value={date.StartDate}
                  onChange={handleStartDate}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group>
              <InputGroup>
                <InputGroup.Text className="filter-date-text">To</InputGroup.Text>
                <Form.Control
                  type="date"
                  value={date.EndDate}
                  onChange={handleEndDate}
                />
              </InputGroup>
            </Form.Group>

            {date.StartDate != "" && date.EndDate != "" &&
              <Button
              size='sm'
              className="float-right"
              onClick={() => handleResetDate()}
            >Reset</Button>
            }
          </Dropdown.Menu>
        </Dropdown>

        <FilterRight>
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
            />
          </a>
        </FilterRight>
      </FilterDiv>
    </React.Fragment>
  )
}

export default FilterOptions
