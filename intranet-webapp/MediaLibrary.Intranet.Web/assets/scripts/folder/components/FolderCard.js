import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import EditModal from './EditModal';

/*----------------------------------------------------------------------Style Constants----------------------------------------------------------------------*/
const cardStyles = {
  borderRadius: '10px',
  marginBottom: '30px',
};

const headerStyles = {
  borderBottom: 'none',
  backgroundColor: 'white',
  borderRadius: '10px 10px 0 0',
};

const titleStyles = {
  fontSize: '0.8em',
  fontWeight: '600',
  color: '#00000050',
  marginTop: '0px',
};

const footerStyles = {
  backgroundColor: 'white',
  borderTop: 'none',
  borderRadius: '0 0 10px 10px',
};

/*----------------------------------------------------------------------Style Constants End----------------------------------------------------------------------*/


/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
const FolderCard = ({ title, description }) => {
  const [showModal, setShowModal] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleEditSave = (updatedDescription) => {
    setEditedDescription(updatedDescription);
    handleCloseModal();
  };


  return (
    <Card style={cardStyles}>
      <Card.Header style={headerStyles}>
        <Card.Title className="mb-1" style={titleStyles}>{title}</Card.Title>
      </Card.Header>
      <Card.Body>
        <Card.Text>{editedDescription}</Card.Text>
        <Card.Footer className="text-right" style={footerStyles}>
          <Button size="sm" variant="primary" onClick={handleShowModal}>
            Edit
          </Button>
        </Card.Footer>
      </Card.Body>
      <EditModal
        show={showModal}
        handleClose={handleCloseModal}
        title={title}
        initialValue={editedDescription}
        handleSave={handleEditSave}
      />
    </Card>
  );
};

export default FolderCard;
/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
