import React, { useState } from 'react'
import { styled } from '@linaria/react'
import { Button } from 'react-bootstrap'

const folderData = [
  {
    id: 1,
    name: 'Information Systems',
    dateModified: '2023-11-20',
    modifiedBy: 'John Lim',
  },
  {
    id: 2,
    name: 'Folder 1',
    dateModified: '2023-11-18',
    modifiedBy: 'Sally Toh',
  },
  {
    id: 3,
    name: 'Folder 2',
    dateModified: '2023-11-29',
    modifiedBy: 'Peter Doe',
  },
  {
    id: 4,
    name: 'Folder 3',
    dateModified: '2023-11-16',
    modifiedBy: 'Sarah Goh',
  },
]


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
  padding: '4px 10px',
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

  const openFolder = (folderId) => {
    console.log(`Opened folder ${folderId}`);
  };

  /*-------------------------------------------------------------------------Logic-------------------------------------------------------------------------*/


  /*-------------------------------------------------------------------------Design-------------------------------------------------------------------------*/
  return (
    <>
      <div>
        <TopDiv>
          <h3 className="my-4">Folders</h3>
          <RightDiv>
          </RightDiv>
          <LeftDiv className="mb-2 mt-0">
            Folders
          </LeftDiv>
        </TopDiv>
        <div className="table-responsive">
          <table className="table align-middle table-nowrap table-hover mb-0 mt-2">
            <thead>
              <tr>
                <th scope="col" style={headerBorderStyle2}>Name</th>
                <th scope="col" style={headerBorderStyle1}>Date Modified</th>
                <th scope="col" style={headerBorderStyle1}>Modified By</th>
              </tr>
            </thead>
            <tbody>
              {folderData?.map((folder) => (
                <tr key={folder.id} >
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
  /*-------------------------------------------------------------------------Design-------------------------------------------------------------------------*/
}

export default FolderList;

/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
