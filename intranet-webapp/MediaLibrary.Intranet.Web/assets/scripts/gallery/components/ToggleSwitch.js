import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Switch from '@mui/material/Switch';
import { styled } from '@linaria/react'

const ToggleDiv = styled.div`
  display: inline;
  margin-right: 20px;
`

const ToggleSwitch = ({ popupChecked, setPopupChecked }) => {
  return (
    <ToggleDiv>
      <span>
        <small className="font-weight-bold">Show Popup</small>
      </span>
      <Switch
        checked={popupChecked}
        onChange={() => setPopupChecked(!popupChecked)}
      />
    </ToggleDiv>
  );
}

ToggleSwitch.propTypes = {
  popupChecked: PropTypes.bool,
  setPopupChecked: PropTypes.func
}

export default ToggleSwitch;
