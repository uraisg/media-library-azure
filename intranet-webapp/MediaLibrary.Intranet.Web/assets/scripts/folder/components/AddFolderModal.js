import React, { useState } from 'react';
import { Modal, Button, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { styled } from '@linaria/react';


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
  backgroundColor: '#f4f4f4',
  resize: 'none',
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    width: '250px',
  }),
  menu: (provided) => ({
    ...provided,
    width: '250px',
  }),
};
/*----------------------------------------------------------------------Style Constants End----------------------------------------------------------------------*/


const AddFolderModal = ({ showModal, handleClose }) => {
  const GroupOptions = [
    { value: 'Group 1', label: 'Group 1' },
    { value: 'Group 2', label: 'Group 2' },
  ];

  const DepartmentOptions = [
    { value: 'Department A', label: 'Department A' },
    { value: 'Department B', label: 'Department B' },
  ];

  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const handleSave = () => {
    // Logic to save folder details
    handleClose();
  };

  return (
    <Modal show={showModal} onHide={handleClose} dialogClassName="modal-dialog-centered" size="lg">
      <button onClick={handleClose} style={closeButtonStyles}>&times;</button>

      <Modal.Header style={modalHeaderStyles}>
        <Modal.Title style={modalTitleStyles}>Add New Folder</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ display: 'flex', padding: '2rem'}}>
        <div style={{ flex: 1, paddingRight: '2rem' }}>
          <h5>Folder Details</h5>
          <Form>
            <Form.Group controlId="folderName" style={{ marginTop:'20px' }}>
              <Form.Control
                style={textAreaStyles}
                type="text"
                placeholder="Enter folder name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
              />
            </Form.Group>
            <Form.Group controlId="folderDescription" style={{ marginTop: '30px' }}>
              <Form.Control
                style={textAreaStyles}
                as="textarea"
                rows={5}
                placeholder="Enter folder description"
                value={folderDescription}
                onChange={(e) => setFolderDescription(e.target.value)}
              />
            </Form.Group>
          </Form>
        </div>

        <div style={{ flex: 1 }}>
          <h5>Folder Members</h5>
          <table className=" table table-borderless">
            <tbody>

              <tr>
                <th className="col-md-2" >Group</th>
                <td>
                  <Select
                    styles={customStyles}
                    value={selectedGroup}
                    onChange={(selectedOption) => setSelectedGroup(selectedOption)}
                    isMulti
                    options={GroupOptions}
                  />
                </td>
              </tr>

              <tr>
                <th className="col-md-2" >Department</th>
                <td>
                  <Select
                    styles={customStyles}
                    value={selectedDepartment}
                    onChange={(selectedOption) => setSelectedDepartment(selectedOption)}
                    isMulti
                    options={DepartmentOptions}
                  />
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </Modal.Body>

      <Modal.Footer style={{ borderTop: 'none' }}>
        <Button size="sm" variant="primary" onClick={handleSave}>
          Add
        </Button>
        <Button size="sm" variant="outline-primary" onClick={handleClose}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFolderModal;
