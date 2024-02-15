import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from '@linaria/react';

const TopDiv = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media only screen and (max-width: 799px) {
    display: block;
  }
`;

const Breadcrumb = ({ path }) => {
  return (
    <TopDiv>
      <Link to="/folders">Folders</Link>
      {path.map((folder, index) => (
        <span key={index}>
          {index !== 0 && <span> / </span>}
          {folder}
        </span>
      ))}
    </TopDiv>
  );
};

export default Breadcrumb;
