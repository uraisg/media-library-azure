import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Button from 'react-bootstrap/Button'
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import Form from 'react-bootstrap/Form'

const Container = styled.div`
  padding: 1rem 15px;
`

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
    console.log(key, currentFilters)
    // Check which tab is active and set the filter specific to it
    if (key === 'none') {
      setFilters({ filterType: 'none' })
    } else if (key === 'postal') {
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

  // Create random unique id for form element (using lazy initial state so that it is only assigned once)
  const [formId] = useState(
    () => 'filter-form-' + Math.random().toString(36).substr(2, 9)
  )

  const areasOptions = areas.map(area => (
    <option key={area.Id} value={area.Id}>{area.Name}</option>
  ))

  return (
    <Container>
      <p>Location Filter</p>
      <Tabs activeKey={key} onSelect={(k) => setKey(k)}>
        <Tab eventKey="none" title="None"></Tab>
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
              value={currentFilters.areaName ? currentFilters.areaName : ''}
              onChange={handleFiltersChange('areaName')}
            >
              <option value="" disabled>Select an area</option>
              {areasOptions}
            </Form.Control>
          </Form.Group>
        </Tab>
      </Tabs>
      <Form id={formId} onSubmit={handleSubmit}>
        <Button variant="primary" type="submit">
          Apply
        </Button>
      </Form>
    </Container>
  )
}

FilterSettings.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
}

export default FilterSettings
