import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';


/*----------------------------------------------------------------------Style Constants----------------------------------------------------------------------*/
const modalHeaderStyles = {
  borderBottom: 'none',
  display: 'flex',
  justifyContent: 'center',
};

const closeButtonStyles = {
  position: 'absolute',
  top: '10px',
  left: '10px',
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  fontSize: '1.5rem',
};

const modalTitleStyles = {
  flex: 1,
  textAlign: 'center',
  marginTop: '15px',
};

const textAreaStyles = {
  border: 'none',
  borderRadius: '5px',
  marginBottom: '5px',
  width: '100%',
  padding: '10px',
  backgroundColor: '#f4f4f4',
  resize: 'none',
  textAlign: 'start',
  lineHeight: '1.5',
  outline: 'none',
};

/*----------------------------------------------------------------------Style Constants End----------------------------------------------------------------------*/


const EditModal = ({ show, handleClose, title, initialValue, handleSave }) => {
  const [editedValue, setEditedValue] = useState(initialValue);

  const handleChange = (e) => {
    setEditedValue(e.target.value);
  };

  return (
    <Modal show={show} onHide={handleClose} dialogClassName="modal-dialog-centered">
      <button onClick={handleClose} style={closeButtonStyles}>&times;</button>
      <Modal.Header style={modalHeaderStyles}>
        <Modal.Title style={modalTitleStyles}>Edit {title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <textarea
          type="text"
          id="editedValue"
          value={editedValue}
          onChange={handleChange}
          rows={5}
          style={textAreaStyles}
        />
      </Modal.Body>
      <Modal.Footer style={{ borderTop: 'none' }}>
        <Button size="sm" variant="primary" onClick={() => handleSave(editedValue)}>
          Save
        </Button>
        <Button size="sm" variant="outline-primary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditModal;
