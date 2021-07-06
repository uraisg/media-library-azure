import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'

const Container = styled.div`
  padding: 1rem 15px;
  display: flex;
  justify-content: space-between;
`

const DropdownMenu = styled(Dropdown.Menu)`
  min-width: 20rem;
`

const DropdownForm = styled.form`
  padding: 0.25rem 1.5rem;
`

const getButtonText = ({ filterType, postalCode, areaName }, areas) => {
  let text = 'Location: '

  if (filterType === 'none') {
    text += 'All'
  } else if (filterType === 'postal') {
    text += postalCode
  } else if (filterType === 'area') {
    text += areas.find(a => a.Id == areaName).Name
  }

  return text
}

const FilterSettings = ({ filters, setFilters, areas }) => {
  const [key, setKey] = useState('none')
  const [currentFilters, setCurrentFilters] = useState({
    areaName: '',
    postalCode: '',
  })

  // Keep our UI consistent with filter settings in slice when they are updated
  useEffect(() => {
    if (filters.filterType === 'none') {
      setCurrentFilters({
        areaName: '',
        postalCode: '',
      })
    } else if (filters.filterType === 'postal') {
      setCurrentFilters({
        areaName: '',
        postalCode: filters.postalCode,
      })
    } else if (filters.filterType === 'area') {
      setCurrentFilters({
        areaName: filters.areaName,
        postalCode: '',
      })
    }
    setKey(filters.filterType)
  }, [filters])

  const handleFiltersChange = (key) => (e) => {
    const value = e.target.value
    setCurrentFilters({
      ...currentFilters,
      [key]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Check which tab is active and set the filter specific to it
    if (key === 'postal') {
      setFilters({
        filterType: 'postal',
        postalCode: currentFilters.postalCode,
      })
    } else if (key === 'area') {
      setFilters({
        filterType: 'area',
        areaName: currentFilters.areaName,
      })
    }
  }

  const handleReset = (e) => {
    e.preventDefault()
    setFilters({ filterType: 'none' })
  }

  // Create random unique id for form element (use a lazy initial state so that it is generated once only)
  const [formId] = useState(
    () => 'filter-form-' + Math.random().toString(36).substr(2, 9)
  )

  const areasOptions = areas.map((area) => (
    <option key={area.Id} value={area.Id}>
      {area.Name}
    </option>
  ))

  const dropdownButtonText = getButtonText(filters, areas)

  return (
    <Container>
      <Dropdown>
        <Dropdown.Toggle variant="outline-theme" id="dropdown-location-filter">
          {dropdownButtonText}
        </Dropdown.Toggle>
        <DropdownMenu>
          <Dropdown.Header>Location type</Dropdown.Header>
          <DropdownForm id={formId} onSubmit={handleSubmit}>
            <Tabs
              id="location-filter-tabs"
              className="mb-3"
              justify
              unmountOnExit={true}
              activeKey={key}
              onSelect={setKey}
            >
              <Tab eventKey="postal" title="Postal Code">
                <Form.Group controlId="postal-input">
                  <Form.Label srOnly>Postal Code</Form.Label>
                  <Form.Control
                    form={formId}
                    type="tel"
                    maxLength={6}
                    pattern="[0-9]{6}"
                    placeholder="Enter postal code (6 digits)"
                    value={currentFilters.postalCode}
                    required
                    onChange={handleFiltersChange('postalCode')}
                  />
                </Form.Group>
              </Tab>
              <Tab eventKey="area" title="Planning Area">
                <Form.Group controlId="area-select">
                  <Form.Label srOnly>Planning Area</Form.Label>
                  <Form.Control
                    form={formId}
                    as="select"
                    value={currentFilters.areaName ?? ''}
                    required
                    onChange={handleFiltersChange('areaName')}
                  >
                    <option value="" disabled>
                      Select an area
                    </option>
                    {areasOptions}
                  </Form.Control>
                </Form.Group>
              </Tab>
            </Tabs>
            <Button variant="theme" type="submit">
              Apply
            </Button>
            <Button variant="link" onClick={handleReset}>
              Reset
            </Button>
          </DropdownForm>
        </DropdownMenu>
      </Dropdown>
    </Container>
  )
}

FilterSettings.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
}

export default FilterSettings
