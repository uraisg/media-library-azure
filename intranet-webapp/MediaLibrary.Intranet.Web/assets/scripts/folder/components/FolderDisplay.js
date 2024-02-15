import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import { styled } from '@linaria/react'
import { Button } from 'react-bootstrap'
import { useFolder } from './context';
import AddFolderModal from './AddFolderModal';


/*----------------------------------------------------------------------Style Constants----------------------------------------------------------------------*/
const TopDiv = styled.div`
  display: relative;
  @media only screen and (max-width: 799px) {
    display: block
  }
`
const RightDiv = styled.div`
  display: inline-flex;
    right: 0;
  position: absolute;

  @media only screen and (max-width: 799px) {
    left: 0;
    position: static;
    display: inline-block;
  }
`
const LeftDiv = styled.div`
  display: inline-flex;
  width: 60%;
  margin-top:2.5em;
`
const headerBorderStyle1 = {
  borderLeft: '1px solid #dee2e6',
  padding:'4px 10px',
  borderTop: 'none',
};

const headerBorderStyle2 = {
  padding: '4px 10px',
  borderTop: 'none',
};

/*----------------------------------------------------------------------Style Constants End----------------------------------------------------------------------*/



/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
const FolderList = () => {

  /*-------------------------------------------------------------------------Logic-------------------------------------------------------------------------*/
  const folderContext = useFolder();

  const openFolder = (folderId) => {
    console.log(`Opened folder ${folderId}`);
  };

  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [selectedFolders, setSelectedFolders] = useState([]);


  const handleAddFolder = () => {
    setShowAddFolderModal(true);
  };

  const handleCloseModal = () => {
    setShowAddFolderModal(false);
  };

  const handleCheckboxChange = (folderId) => {
    const index = selectedFolders.indexOf(folderId);
    if (index === -1) {
      setSelectedFolders([...selectedFolders, folderId]);
    } else {
      setSelectedFolders(selectedFolders.filter((id) => id !== folderId));
    }
  };

  /*-------------------------------------------------------------------------Logic-------------------------------------------------------------------------*/


  /*-------------------------------------------------------------------------Design-------------------------------------------------------------------------*/
  return (
    <>
      <div>
        <TopDiv>
          <h3 className="my-4">Folders</h3>
          <RightDiv className="mr-4 mb-4">
            <Button size="sm" className="mr-4 btn-success pr-3 py-2" onClick={handleAddFolder} >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-plus" viewBox="0 0 16 16">
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
              </svg>
              Add Folder
            </Button>
            <Button size="sm" className="mr-4 btn-danger pr-3 py-2" disabled={selectedFolders.length === 0}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="18" fill="currentColor" className="bi bi-dash mr-1" viewBox="0 0 10 18">
                <path d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z" />
              </svg>
              Remove Folder
            </Button>
          </RightDiv>
          <LeftDiv className="mb-2"> 
            Folders 
          </LeftDiv>
        </TopDiv>
        <div className="table-responsive">
          <table className="table align-middle table-nowrap table-hover mb-0 mt-2">
            <thead>
              <tr>
                <th scope="col" style={headerBorderStyle2}></th>
                <th scope="col" style={headerBorderStyle1}>Name</th>
                <th scope="col" style={headerBorderStyle1}>Date Modified</th>
                <th scope="col" style={headerBorderStyle1}>Modified By</th>
                <th scope="col" style={headerBorderStyle1}>Folder Details</th>
              </tr>
            </thead>
            <tbody>
              {folderContext.folderData?.map((folder) => (
                <tr key={folder.id} >
                  <td>
                    <input type="checkbox"
                      checked={selectedFolders.includes(folder.id)}
                      onChange={() => handleCheckboxChange(folder.id)} />
                  </td>
                  <td>
                    <div className="d-flex align-items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-folder mr-1" width="26" height="26" viewBox="0 0 24 24"
                        stroke="#FFD700" fill="#FFD700">
                        <path d="M5 4h4l3 3h7a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-11a2 2 0 0 1 2 -2" />
                      </svg>
                      {folder.name}
                    </div>
                  </td>
                  <td>{folder.dateModified}</td>
                  <td>{folder.modifiedBy}</td>
                  <td>
                    <Link to={`/folder-details/${folder.id}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-info-circle" width="26" height="26" viewBox="0 0 24 24"
                        strokeWidth="1.3" stroke="#212529" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                        <path d="M12 9h.01" />
                        <path d="M11 12h1v4h1" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <AddFolderModal showModal={showAddFolderModal} handleClose={handleCloseModal} />
    </>
  );
  /*-------------------------------------------------------------------------Design-------------------------------------------------------------------------*/
}

export default FolderList;

/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
