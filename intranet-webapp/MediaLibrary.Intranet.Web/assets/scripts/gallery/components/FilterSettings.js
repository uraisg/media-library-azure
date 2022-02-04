import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import SpatialFilter from '@/components/SpatialFilter'
import LayoutTypeSwitch from '@/components/LayoutTypeSwitch'

const Container = styled.div`
  padding: 1rem;
  margin: 0 -0.25rem;
  display: flex;
  justify-content: space-between;
`

const PushRight = styled.div`
  margin: 0 0.25rem 0 auto;
`

const StyledDropdown = styled(Dropdown)`
  margin: 0 0.25rem;
`

const DropdownMenu = styled(Dropdown.Menu)`
  min-width: 20rem;
`

const DropdownForm = styled.form`
  padding: 0.25rem 1.5rem;
`

const getButtonText2 = ({ filterType, date1, date2 }) => {
  let text = 'Date: '
  if (filterType === 'none') {
    text += 'All'
  } else if (filterType === 'uploaded') {
    text += date1 + ' to ' + date2
  } else if (filterType === 'taken') {
    text += date1 + ' to ' + date2
  }

  return text
}

const FilterSettings = ({
  filters,
  setFilters,
  areas,
  gridView,
  onSetView,
}) => {
  const [key, setKey] = useState('none')
  const [currentFilters, setCurrentFilters] = useState({
    areaName: '',
    postalCode: '',
  })

  const resetCurrentFilters = () => {
    if (filters.filterType === 'none') {
      setCurrentFilters({
        uploaded: '',
        uploaded2: '',
        taken: '',
        taken2: '',
      })
    } else if (filters.filterType === 'uploaded') {
      setCurrentFilters({
        uploaded: filters.date1,
        uploaded2: filters.date2,
        taken: '',
        taken2: '',
      })
    } else if (filters.filterType === 'taken') {
      setCurrentFilters({
        uploaded: '',
        uploaded2: '',
        taken: filters.date1,
        taken2: filters.date2,
      })
    }
    setKey(filters.filterType)
  }

  // Keep our UI consistent with filter settings in slice when they are updated
  useEffect(() => {
    resetCurrentFilters()
  }, [filters])

  const handleFiltersChange = (key) => (e) => {
    const value = e.target.value
    setCurrentFilters({
      ...currentFilters,
      [key]: value,
    })
  }

  const handleToggle = (isOpen) => {
    if (!isOpen) {
      resetCurrentFilters()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Check which tab is active and set the filter specific to it
    if (key === 'Uploaded') {
      setFilters({
        filterType: 'uploaded',
        date1: currentFilters.uploaded,
        date2: currentFilters.uploaded2,
      })
    } else if (key === 'Taken') {
      setFilters({
        filterType: 'taken',
        date1: currentFilters.taken,
        date2: currentFilters.taken2,
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

  const dropdownButtonText2 = getButtonText2(filters)

  return (
    <Container>
      <SpatialFilter filters={filters} setFilters={setFilters} areas={areas} />
      <StyledDropdown onToggle={handleToggle}>
        <Dropdown.Toggle
          size="sm"
          variant="outline-primary"
          id="dropdown-date-filter"
        >
          {dropdownButtonText2}
        </Dropdown.Toggle>
        <DropdownMenu>
          <Dropdown.Header>Date selection</Dropdown.Header>
          <DropdownForm id={formId} onSubmit={handleSubmit}>
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
                eventKey="Uploaded"
                title="Uploaded"
              >
                <Form.Group controlId="date-input">
                  <Form.Label srOnly>Uploaded Date</Form.Label>
                    <Form.Control
                    form={formId}
                    size="sm"
                    type="date"
                    placeholder="Enter uploaded date (from)"
                    value={currentFilters.uploaded}
                    required
                    onChange={handleFiltersChange('uploaded')}

                    />
                </Form.Group>
                <Form.Group controlId="date-input">
                  <Form.Label srOnly>Uploaded Date</Form.Label>
                  <Form.Control
                    form={formId}
                    size="sm"
                    type="date"
                    placeholder="Enter uploaded date (to)"
                      value={currentFilters.uploaded2}
                    //required
                    onChange={handleFiltersChange('uploaded2')}
                  />
                </Form.Group>
              </Tab>
              <Tab
                tabClassName="nav-link-sm"
                eventKey="Taken"
                title="Taken"
              >
                <Form.Group controlId="date-input">
                  <Form.Label srOnly>Taken Date</Form.Label>
                    <Form.Control
                      form={formId}
                      size="sm"
                      type="date"
                      placeholder="Enter taken date (from)"
                      value={currentFilters.taken}
                      required
                      onChange={handleFiltersChange('taken')}
                    />
                  </Form.Group>
                  <Form.Group controlId="date-input">
                    <Form.Label srOnly>Taken Date</Form.Label>
                    <Form.Control
                      form={formId}
                      size="sm"
                      type="date"
                      placeholder="Enter taken date (to)"
                      value={currentFilters.taken2}
                      required
                      onChange={handleFiltersChange('taken2')}
                    />
                  </Form.Group>
              </Tab>
            </Tabs>
            <Button size="sm" variant="primary" type="submit">
              Apply
            </Button>
            <Button size="sm" variant="link" onClick={handleReset}>
              Reset
            </Button>
          </DropdownForm>
        </DropdownMenu>
      </StyledDropdown>
      <PushRight>
        <LayoutTypeSwitch gridView={gridView} setGridView={onSetView} />
      </PushRight>
    </Container>
  )
}

FilterSettings.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
}

export default FilterSettings
