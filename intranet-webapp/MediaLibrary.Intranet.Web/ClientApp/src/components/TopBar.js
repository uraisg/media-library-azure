import React, { useState } from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  width: 100%;
  padding: 1rem 15px;
  background-color: purple;
`

const TopBar = ({ searchTerm, setSearchTerm }) => {
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm)

  const handleInputChange = (e) => {
    setCurrentSearchTerm(e.target.value)
  }

  const handleInputKeyDown = (e) => {
    // If the user pressed the Enter key
    const trimmed = currentSearchTerm.trim()
    if (e.which === 13 || e.keyCode === 13) {
      // Trigger callback function from props
      setSearchTerm(trimmed)
    }
  }

  const handleButtonClick = () => {
    const trimmed = currentSearchTerm.trim()
    // Trigger callback function from props
    setSearchTerm(trimmed)
  }

  return (
    <Container>
      <div className="input-group">
        <input
          className="form-control border border-right-0"
          type="text"
          value={currentSearchTerm}
          placeholder="Search..."
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
        />
        <span className="input-group-append">
          <button
            className="btn btn-theme border-left-0"
            onClick={handleButtonClick}
          >
            Search
          </button>
        </span>
      </div>
    </Container>
  )
}

TopBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
}

export default TopBar
