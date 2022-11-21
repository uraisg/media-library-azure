import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import AdvancedSearchForm from '@/components/AdvancedSearchForm';

const TopBar = ({ searchTerm, setSearchTerm }) => {
  const [currentSearchTerm, setCurrentSearchTerm] = useState(searchTerm);
  const [advancedSearchBtn, setAdvancedSearchBtn] = useState(false);
  const [displayAdvancedSearch, setDisplayAdvancedSearch] = useState(false);

  useEffect(() => {
    setCurrentSearchTerm(searchTerm)
  }, [searchTerm])

  const modalRoot = document.querySelector('#navbar-main')
  const nav = modalRoot.querySelector('.navbar-nav')
  const [container] = useState(document.createElement('div'))
  container.classList.add('flex-grow-1', 'mx-4')

  useEffect(() => {
    modalRoot.insertBefore(container, nav)
    return () => {
      modalRoot.removeChild(container)
    }
  }, [])

  const handleInputChange = (e) => {
    setCurrentSearchTerm(e.target.value)
  }

  const handleInputKeyDown = (e) => {
    // If the user pressed the Enter key
    const trimmed = currentSearchTerm.trim()
    if (e.which === 13 || e.keyCode === 13) {
      // Trigger callback function from props
      setSearchTerm(trimmed);
      setDisplayAdvancedSearch(false);
    }
  }

  const handleButtonClick = () => {
    const trimmed = currentSearchTerm.trim()
    // Trigger callback function from props
    setSearchTerm(trimmed);
    setDisplayAdvancedSearch(false);
  }

  useEffect(() => {
    const trimmed = currentSearchTerm.trim()

    if (trimmed.length == 0) {
      setAdvancedSearchBtn(false);
    }
    else {
      setAdvancedSearchBtn(true);
    }
  }, [currentSearchTerm])

  const contentStyle = { background: "white", width: "60%", zIndex: 10000 };

  return ReactDOM.createPortal(
    <InputGroup>
      <Form.Control
        placeholder="Search..."
        aria-label="Search"
        value={currentSearchTerm}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        />
      {advancedSearchBtn && (
        <InputGroup.Append>
          <Popup trigger={
            <Button variant="outline-primary">v</Button>
          }
            position="bottom right"
            arrow={false}
            closeOnDocumentClick={false}
            open={displayAdvancedSearch}
            onOpen={() => setDisplayAdvancedSearch(true)}
            {...{ contentStyle }}
          >
            <AdvancedSearchForm
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              currentSearchTerm={currentSearchTerm}
              setCurrentSearchTerm={setCurrentSearchTerm}
              displayAdvancedSearch={displayAdvancedSearch}
              setDisplayAdvancedSearch={setDisplayAdvancedSearch}
            />
          </Popup>
        </InputGroup.Append>
      )}
      <InputGroup.Append>
        <Button variant="outline-primary" onClick={handleButtonClick}>
          {/* prettier-ignore */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
            <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
          </svg>
        </Button>
      </InputGroup.Append>
    </InputGroup>,
    container
  )
}

TopBar.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
}

export default TopBar
