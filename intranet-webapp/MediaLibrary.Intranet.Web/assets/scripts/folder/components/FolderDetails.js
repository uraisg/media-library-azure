import React from 'react';
import { styled } from '@linaria/react';
import { Link } from 'react-router-dom';
import { useFolder } from './context';
import { useParams } from 'react-router-dom';
import FolderMembersTable from './FolderMembers';
import FolderCard from './FolderCard';


/*----------------------------------------------------------------------Style Constants----------------------------------------------------------------------*/
const TopDiv = styled.div`
  display: relative;
  @media only screen and (max-width: 799px) {
    display: block
  }
`;

const BottomDiv = styled.div`
  display: flex;
  height: 50vh;
`;

const LeftHalf = styled.div`
  width: 50%;
  padding: 0 10px;
`;

const RightHalf = styled.div`
  width: 50%;
  padding: 0 10px;
`;

/*----------------------------------------------------------------------Style Constants End----------------------------------------------------------------------*/


/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
const FolderDetailsTable = () => {
  const { id } = useParams();
  const folderContext = useFolder();

  const folder = folderContext.folderData.find(folder => folder.id.toString() === id);

  return (
    <>
      <TopDiv>
        <Link to="/Folder" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 className="my-4">Folders</h3>
        </Link>
        <h5 className="mb-4">{folder ? folder.name : 'Folder Not Found'} Folder Details</h5>
      </TopDiv>
      <BottomDiv>
        <LeftHalf>
          <FolderCard title="Folder Name" description={folder.name} />
          <FolderCard title="Folder Description" description={folder.folderDetails.description} />
        </LeftHalf>
        <RightHalf>
          <FolderMembersTable folderId={folder ? folder.id.toString() : null} />
        </RightHalf>
      </BottomDiv>
    </>
  );
};

export default FolderDetailsTable;
/*-------------------------------------------------------------------------Main Component-------------------------------------------------------------------------*/
