import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import Button from 'react-bootstrap/Button'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import Tab from 'react-bootstrap/Tab'
import Tabs from 'react-bootstrap/Tabs'
import { SpatialFilters } from '@/slices/gallerySlice'

const StyledDropdown = styled(Dropdown)`
  margin: 0 0.25rem;
`

const DropdownMenu = styled(Dropdown.Menu)`
  min-width: 20rem;
`

const DropdownForm = styled(Form)`
  padding: 0.25rem 1.5rem;
`

const SpatialFilter = ({ filters, setFilters, areas }) => {
  const [show, setShow] = useState(false)
  const [key, setKey] = useState('none')
  const [inputs, setInputs] = useState({
    areaName: '',
    postalCode: '',
  })

  const resetInputs = () => {
    if (filters.spatial.type === SpatialFilters.All) {
      setInputs({
        areaName: '',
        postalCode: '',
      })
    } else if (filters.spatial.type === SpatialFilters.Postal) {
      setInputs({
        areaName: '',
        postalCode: filters.spatial.postalCode,
      })
    } else if (filters.spatial.type === SpatialFilters.Area) {
      setInputs({
        areaName: filters.spatial.areaName,
        postalCode: '',
      })
    }
    setKey(filters.spatial.type)
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
    if (key === 'postal') {
      setFilters({
        spatial: {
          type: SpatialFilters.Postal,
          postalCode: inputs.postalCode,
        },
      })
    } else if (key === 'area') {
      setFilters({
        spatial: {
          type: SpatialFilters.Area,
          areaName: inputs.areaName,
        },
      })
    }
  }

  const handleReset = (e) => {
    e.preventDefault()
    setShow(false)
    setFilters({
      spatial: {
        type: SpatialFilters.All,
      },
    })
  }

  const getSummaryText = ({ type, postalCode, areaName }, areas) => {
    let text = 'Location: '
    if (type === SpatialFilters.All) {
      text += 'All'
    } else if (type === SpatialFilters.Postal) {
      text += postalCode
    } else if (type === SpatialFilters.Area) {
      text += areas.flatMap((r) => r.Areas).find((a) => a.Id == areaName)?.Name || areaName
    }

    return text
  }

  const areasOptions = areas.map((region) => {
    const options = region.Areas.map((area) => (
      <option key={area.Id} value={area.Id}>
        {area.Name}
      </option>
    ))

    return (
      <optgroup label={region.Region}>
        {options}
      </optgroup>
    )
  })

  return (
    <StyledDropdown show={show} onToggle={handleToggle}>
      <Dropdown.Toggle
        id="dropdown-location-filter"
        size="sm"
        variant="outline-primary"
      >
        {getSummaryText(filters.spatial, areas)}
      </Dropdown.Toggle>
      <DropdownMenu>
        <Dropdown.Header>Location type</Dropdown.Header>
        <DropdownForm onSubmit={handleSubmit}>
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
              <Form.Group className="form-group2" controlId="postal-input">
                <Form.Label srOnly>Postal Code</Form.Label>                
                <Form.Control
                  size="sm"
                  type="tel"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="Enter postal code (6 digits)"
                  value={inputs.postalCode}
                  required
                  onChange={handleInputChange('postalCode')}
                />
                <div className="postalSearchBufferInfo">search results within radius of 500m will be displayed</div>
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
                  size="sm"
                  as="select"
                  value={inputs.areaName ?? ''}
                  required
                  onChange={handleInputChange('areaName')}
                >
                  <option value="" disabled>
                    Select an area
                  </option>
                  {areasOptions}
                </Form.Control>
              </Form.Group>
            </Tab>
          </Tabs>
          <Button size="sm" variant="primary" type="submit" className="mr-1">
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

SpatialFilter.propTypes = {
  filters: PropTypes.object.isRequired,
  setFilters: PropTypes.func.isRequired,
  areas: PropTypes.array.isRequired,
}

export default SpatialFilter
