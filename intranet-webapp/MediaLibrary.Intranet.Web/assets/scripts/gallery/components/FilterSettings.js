import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import Tooltip from 'react-bootstrap/Tooltip'

const Container = styled.div`
  padding: 1rem;
  display: flex;
  justify-content: space-between;
`

const DropdownMenu = styled(Dropdown.Menu)`
  min-width: 20rem;
`

const DropdownForm = styled.form`
  padding: 0.25rem 1.5rem;
`

const TooltipOverlay = ({ message, placement = 'bottom', ...props }) => {
  return (
    <OverlayTrigger
      overlay={<Tooltip>{message}</Tooltip>}
      placement={placement}
      {...props}
    >
      {props.children}
    </OverlayTrigger>
  )
}

const LayoutTypeSwitch = ({ gridView, setGridView }) => {
  return (
    <div>
      <span className="mr-2">
        <small className="font-weight-bold">Layout</small>
      </span>
      <ButtonGroup size="sm" aria-label="Basic example">
        <TooltipOverlay message="View in grid layout">
          <Button
            variant="outline-primary"
            active={gridView}
            onClick={() => setGridView(true)}
          >
            <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-grid" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="View in grid layout">
              <path fillRule="evenodd" d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"></path>
            </svg>
          </Button>
        </TooltipOverlay>
        <TooltipOverlay message="View in list layout">
          <Button
            variant="outline-primary"
            active={!gridView}
            onClick={() => setGridView(false)}
          >
            <svg width="1em" height="1em" viewBox="0 0 16 16" className="bi bi-view-list" fill="currentColor" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="View in list layout">
              <path fillRule="evenodd" d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2zm0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14z"></path>
            </svg>
          </Button>
        </TooltipOverlay>
      </ButtonGroup>
    </div>
  )
}

const getButtonText = ({ filterType, postalCode, areaName }, areas) => {
  let text = 'Location: '

  if (filterType === 'none') {
    text += 'All'
  } else if (filterType === 'postal') {
    text += postalCode
  } else if (filterType === 'area') {
    text += areas.find((a) => a.Id == areaName)?.Name || areaName
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
        <Dropdown.Toggle
          size="sm"
          variant="outline-primary"
          id="dropdown-location-filter"
        >
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
              <Tab
                tabClassName="nav-link-sm"
                eventKey="postal"
                title="Postal Code"
              >
                <Form.Group controlId="postal-input">
                  <Form.Label srOnly>Postal Code</Form.Label>
                  <Form.Control
                    form={formId}
                    size="sm"
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
              <Tab
                tabClassName="nav-link-sm"
                eventKey="area"
                title="Planning Area"
              >
                <Form.Group controlId="area-select">
                  <Form.Label srOnly>Planning Area</Form.Label>
                  <Form.Control
                    form={formId}
                    size="sm"
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
            <Button size="sm" variant="primary" type="submit">
              Apply
            </Button>
            <Button size="sm" variant="link" onClick={handleReset}>
              Reset
            </Button>
          </DropdownForm>
        </DropdownMenu>
      </Dropdown>
      <LayoutTypeSwitch gridView={gridView} setGridView={onSetView} />
    </Container>
  )
}

FilterSettings.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
}

export default FilterSettings
