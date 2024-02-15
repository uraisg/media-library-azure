import React, { createContext, useState, useContext } from 'react';


export const FolderContext = createContext();

export const useFolder = () => {
  return useContext(FolderContext)
}

export const FolderProvider = ({ children }) => {

  const [folderData, setFolderData] = useState([
    {
      id: 1,
      name: 'Information Systems',
      dateModified: '2023-11-20',
      modifiedBy: 'John Doe',
      folderDetails: {
        description: 'Folder for Information Systems Group Staff',
        members: [
          { id: 1, name: 'Member 1', group: 'Group A', department: 'Dept X' },
          { id: 2, name: 'Member 2', group: 'Group B', department: 'Dept Y' },
          { id: 3, name: 'Member 3', group: 'Group C', department: 'Dept Z' },
          { id: 4, name: 'Member 4', group: 'Group A', department: 'Dept X' },
          { id: 5, name: 'Member 5', group: 'Group B', department: 'Dept Y' },
          { id: 6, name: 'Member 6', group: 'Group C', department: 'Dept Z' },
          { id: 7, name: 'Member 7', group: 'Group A', department: 'Dept X' },
          { id: 8, name: 'Member 8', group: 'Group B', department: 'Dept Y' },
          { id: 9, name: 'Member 9', group: 'Group C', department: 'Dept Z' },
        ],
      },
    },
    {
      id: 2,
      name: 'Corporate Development',
      dateModified: '2023-11-18',
      modifiedBy: 'Jane Smith',
      folderDetails: {
        description: 'Folder for Corporate Development Group Staff',
        members: [
          { id: 10, name: 'Member 1', group: 'Group D', department: 'Dept X' },
          { id: 11, name: 'Member 2', group: 'Group A', department: 'Dept Z' },
        ],
      },
    },
  ]);

  return (
    <FolderContext.Provider value={{ folderData, setFolderData }}>
      {children}
    </FolderContext.Provider>
  );
};
