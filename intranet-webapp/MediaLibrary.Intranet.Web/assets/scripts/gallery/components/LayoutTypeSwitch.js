import React from 'react'
import PropTypes from 'prop-types'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'

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

TooltipOverlay.propTypes = {
  message: PropTypes.string,
  placement: PropTypes.string,
  children: PropTypes.element,
}

const LayoutTypeSwitch = ({ gridView, setGridView }) => {
  return (
    <div className="d-inline-flex">
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
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              className="bi bi-grid"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="View in grid layout"
            >
              <path
                fillRule="evenodd"
                d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"
              ></path>
            </svg>
          </Button>
        </TooltipOverlay>
        <TooltipOverlay message="View in list layout">
          <Button
            variant="outline-primary"
            active={!gridView}
            onClick={() => setGridView(false)}
          >
            <svg
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              className="bi bi-view-list"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="View in list layout"
            >
              <path
                fillRule="evenodd"
                d="M3 4.5h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2zm0 1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1H3zM1 2a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 2zm0 12a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 0 1h-13A.5.5 0 0 1 1 14z"
              ></path>
            </svg>
          </Button>
        </TooltipOverlay>
      </ButtonGroup>
    </div>
  )
}

LayoutTypeSwitch.propTypes = {
  gridView: PropTypes.bool.isRequired,
  setGridView: PropTypes.func.isRequired,
}

export default LayoutTypeSwitch
