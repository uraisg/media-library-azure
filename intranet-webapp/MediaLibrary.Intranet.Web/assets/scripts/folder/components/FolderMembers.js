import React, { useState } from 'react';
import { Card, Button, Modal} from 'react-bootstrap';
import Select from 'react-select'
import { useFolder } from './context';


/*----------------------------------------------------------------------Style Constants----------------------------------------------------------------------*/
const cardStyles = {
  borderRadius: '10px',
};

const titleStyles = {
  fontSize: '0.8em',
  fontWeight: '600',
  color: '#00000050',
  marginTop: '0px',
};

const tableDivStyles = {
  overflowY: 'auto',
  maxHeight: '350px',
  marginLeft: '20px', // Adjust as needed
  marginRight: '20px', // Adjust as needed
};

const tableHeaderStyles = {
  position: "sticky",
  top: "0",
  background: 'white',
};

const headerBorderStyle = {
  borderTop: 'none',
};

const footerStyles = {
  backgroundColor: 'white',
  borderTop: 'none',
  borderRadius: '0 0 10px 10px',
  marginLeft: '20px', // Adjust as needed
  marginRight: '20px', // Adjust as needed
};

const customStyles = {
  control: (provided) => ({
    ...provided,
    width: '300px',
  }),
  menu: (provided) => ({
    ...provided,
    width: '300px',
  }),
};

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



/*----------------------------------------------------------------------Style Constants End----------------------------------------------------------------------*/



/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
const FolderMembersTable = ({ folderId }) => {

  /*-------------------------------------------------------------------------Logic-------------------------------------------------------------------------*/
  const folderContext = useFolder();

  const folderMembers = folderContext.folderData.find(folder => folder.id.toString() === folderId)?.folderDetails.members || [];
  const folderName = folderContext.folderData.find(folder => folder.id.toString() === folderId)?.name || 'Folder Name';


  const GroupOptions = [
    { value: 'Group 1', label: 'Group 1' },
    { value: 'Group 2', label: 'Group 2' },
  ];

  const DepartmentOptions = [
    { value: 'Department A', label: 'Department A' },
    { value: 'Department B', label: 'Department B' },
  ];

  const [selectedRows, setSelectedRows] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);


  const handleCheckboxChange = (itemId) => {
    setSelectedRows((prevSelectedRows) => {
      if (prevSelectedRows.includes(itemId)) {
        return prevSelectedRows.filter((id) => id !== itemId);
      } else {
        return [...prevSelectedRows, itemId];
      }
    });
  };

  const handleAddButtonClick = () => {
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSelectedGroup('');
    setSelectedDepartment('');
  };

  const handleSave = () => {
    // Logic to save the selectedGroup and selectedDepartment
    // Add logic to save the selections
    handleClose();
  };

  const handleRemoveButtonClick = () => {
    if (selectedRows.length === 1) {
      const selectedMemberId = selectedRows[0];
      const memberToRemove = folderMembers.find(member => member.id === selectedMemberId);
      setSelectedMember(memberToRemove);
      setShowRemoveModal(true);
    } else {
      // Handle multiple selection error (if needed)
    }
  };

  const handleRemoveConfirm = () => {
    // Logic to remove the selected member
    // Implement removal logic

    // Close the remove modal and reset state
    setShowRemoveModal(false);
    setSelectedRows([]);
  };

  const handleCloseRemoveModal = () => {
    setShowRemoveModal(false);
    setSelectedMember(null);
  };
  /*-------------------------------------------------------------------------Logic-------------------------------------------------------------------------*/


  /*-------------------------------------------------------------------------Design-------------------------------------------------------------------------*/
  return (
      <Card style={cardStyles}>
        <Card.Body>
          <Card.Title className="mb-4" style={titleStyles}>Folder Members</Card.Title>
          <div style={tableDivStyles}>
            <table className="table">
              <thead style={tableHeaderStyles}>
                <tr>
                  <th style={headerBorderStyle}></th>
                  <th style={headerBorderStyle}>Group</th>
                  <th style={headerBorderStyle}>Department</th>
                </tr>
              </thead>
              <tbody>
                {folderMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(member.id)}
                        onChange={() => handleCheckboxChange(member.id)}
                      />
                    </td>
                    <td>{member.group}</td>
                    <td>{member.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card.Body>
        <Card.Footer className="text-right" style={footerStyles}>
        <Button size="sm" variant="success" className="mr-2" onClick={handleAddButtonClick}>
            Add
          </Button>
        <Button size="sm" variant="danger" onClick={handleRemoveButtonClick} disabled={selectedRows.length !== 1}>
            Remove
          </Button>
      </Card.Footer>

      {/*---------------------------------------------------------------------Add Modal---------------------------------------------------------------------*/}
      <Modal show={showModal} onHide={handleClose} dialogClassName="modal-dialog-centered">
        <button onClick={handleClose} style={closeButtonStyles}>&times;</button>
        <Modal.Header style={modalHeaderStyles}>
          <Modal.Title style={modalTitleStyles}>Add Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <table className=" table table-borderless table-responsive-lg table-sm mx-auto" style={{ width: '90%' }}>
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
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button size="sm" variant="primary" onClick={handleSave}>
            Save
          </Button>
          <Button size="sm" variant="outline-primary" onClick={handleClose}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      {/*---------------------------------------------------------------------Add Modal---------------------------------------------------------------------*/}

      {/*--------------------------------------------------------------------Remove Modal--------------------------------------------------------------------*/}
      <Modal show={showRemoveModal} onHide={handleCloseRemoveModal} dialogClassName="modal-dialog-centered">
        <button onClick={handleCloseRemoveModal} style={closeButtonStyles}>&times;</button>
        <Modal.Header style={modalHeaderStyles}>
          <Modal.Title style={modalTitleStyles}>Remove Folder Member</Modal.Title>
        </Modal.Header>
        <Modal.Body style={modalHeaderStyles}>
          <div>
            <p>Remove Folder Member</p>
            {selectedMember && (
              <div>
                <p><b>Group:</b> {selectedMember.group}</p>
                <p><b>Department:</b> {selectedMember.department}</p>
              </div>
            )}
            <p>from {folderName} Folder?</p>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: 'none' }}>
          <Button size="sm" variant="primary" onClick={handleRemoveConfirm}>
            Remove
          </Button>
          <Button size="sm" variant="outline-primary" onClick={handleCloseRemoveModal}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>
      {/*--------------------------------------------------------------------Remove Modal--------------------------------------------------------------------*/}
      </Card>
  )
  /*-------------------------------------------------------------------------Design-------------------------------------------------------------------------*/
};

export default FolderMembersTable;
/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
