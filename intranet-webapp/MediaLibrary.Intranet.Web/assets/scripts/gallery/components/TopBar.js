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
        <InputGroup.Append>
          <Popup trigger={
            <Button variant="outline-primary">
              {displayAdvancedSearch ?
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-up" viewBox="0 0 16 16">
                  <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z" />
                </svg>
                :
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-chevron-down" viewBox="0 0 16 16">
                  <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z" />
                </svg>
              }
            </Button>
          }
            position="bottom right"
            arrow={false}
            closeOnDocumentClick={false}
            open={displayAdvancedSearch}
            onOpen={() => setDisplayAdvancedSearch(true)}
            onClose={() => setDisplayAdvancedSearch(false)}
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
