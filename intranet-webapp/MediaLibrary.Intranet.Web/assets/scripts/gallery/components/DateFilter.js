import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { styled } from '@linaria/react'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { parseISO } from 'date-fns'
import { DateFilters } from '@/slices/gallerySlice'

const StyledDropdown = styled(Dropdown)`
  margin: 0 0.25rem;
`

const DropdownMenu = styled(Dropdown.Menu)`
  min-width: 17rem;
`

const DropdownForm = styled(Form)`
  padding: 0.25rem 1.5rem;
`

const StyledInputGroupText = styled(InputGroup.Text)`
  width: 3.5em;
`

function parseAndFormatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('default', options).format(parseISO(date))
}

const DateFilter = ({ filters, setFilters }) => {
  const [show, setShow] = useState(false)
  const [key, setKey] = useState('none')
  const [inputs, setInputs] = useState({
    dateFrom: '',
    dateTo: '',
  })

  const resetInputs = () => {
    setInputs({
      dateFrom: filters.temporal.dateFrom ?? '',
      dateTo: filters.temporal.dateTo ?? '',
    })
    setKey(filters.temporal.type)
  }

  // Keep our UI consistent with filter settings in slice when they are updated
  useEffect(() => {
    resetInputs()
  }, [filters])

  const handleToggle = (isOpen) => {
    setShow(isOpen)
    if (!isOpen) {
      resetInputs()
    }
  }

  const handleInputChange = (key) => (e) => {
    const value = e.target.value
    setInputs({
      ...inputs,
      [key]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setShow(false)
    // Check which tab is active and set the filter specific to it
    if (key === 'uploaded') {
      setFilters({
        temporal: {
          type: DateFilters.Uploaded,
          dateFrom: inputs.dateFrom,
          dateTo: inputs.dateTo,
        },
      })
    } else if (key === 'taken') {
      setFilters({
        temporal: {
          type: DateFilters.Taken,
          dateFrom: inputs.dateFrom,
          dateTo: inputs.dateTo,
        },
      })
    }
  }

  const handleReset = (e) => {
    e.preventDefault()
    setShow(false)
    setFilters({
      temporal: {
        type: DateFilters.All,
      },
    })
  }

  const getSummaryText = ({ type, dateFrom, dateTo }) => {
    if (type === DateFilters.All) {
      return 'Any time'
    }

    let text = ''
    if (type === DateFilters.Uploaded) {
      text += 'Uploaded: '
    } else if (type === DateFilters.Taken) {
      text += 'Taken: '
    }

    if (dateFrom && dateTo) {
      text += parseAndFormatDate(dateFrom) + ' – ' + parseAndFormatDate(dateTo)
    } else if (dateFrom) {
      text += 'After ' + parseAndFormatDate(dateFrom)
    } else if (dateTo) {
      text += 'Before ' + parseAndFormatDate(dateTo)
    }

    return text
  }

  return (
    <StyledDropdown show={show} onToggle={handleToggle}>
      <Dropdown.Toggle
        id="dropdown-date-filter"
        size="sm"
        variant="outline-primary"
      >
        {getSummaryText(filters.temporal)}
      </Dropdown.Toggle>
      <DropdownMenu>
        <Dropdown.Header>Date selection</Dropdown.Header>
        <DropdownForm onSubmit={handleSubmit}>
          <Tabs
            id="date-filter-tabs"
            className="mb-3"
            justify
            unmountOnExit={true}
            activeKey={key}
            onSelect={setKey}
          >
            <Tab
              tabClassName="nav-link-sm"
              eventKey="uploaded"
              title="Uploaded"
            >
              <Form.Group controlId="date-uploaded-input">
                <Form.Label srOnly>Date Uploaded</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <StyledInputGroupText>From</StyledInputGroupText>
                  </InputGroup.Prepend>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={inputs.dateFrom}
                    onChange={handleInputChange('dateFrom')}
                  />
                </InputGroup>
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <StyledInputGroupText>To</StyledInputGroupText>
                  </InputGroup.Prepend>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={inputs.dateTo}
                    onChange={handleInputChange('dateTo')}
                  />
                </InputGroup>
              </Form.Group>
            </Tab>
            <Tab tabClassName="nav-link-sm" eventKey="taken" title="Taken">
              <Form.Group controlId="date-taken-input">
                <Form.Label srOnly>Date Taken</Form.Label>
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <StyledInputGroupText>From</StyledInputGroupText>
                  </InputGroup.Prepend>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={inputs.dateFrom}
                    onChange={handleInputChange('dateFrom')}
                  />
                </InputGroup>
                <InputGroup size="sm">
                  <InputGroup.Prepend>
                    <StyledInputGroupText>To</StyledInputGroupText>
                  </InputGroup.Prepend>
                  <Form.Control
                    size="sm"
                    type="date"
                    value={inputs.dateTo}
                    onChange={handleInputChange('dateTo')}
                  />
                </InputGroup>
              </Form.Group>
            </Tab>
          </Tabs>
          <Button
            size="sm"
            variant="primary"
            type="submit"
            disabled={!(inputs.dateFrom || inputs.dateTo)}
            className="mr-1"
          >
            Apply
          </Button>
          <Button size="sm" variant="link" onClick={handleReset}>
            Reset
          </Button>
        </DropdownForm>
      </DropdownMenu>
    </StyledDropdown>
  )
}

DateFilter.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
}

export default DateFilter
