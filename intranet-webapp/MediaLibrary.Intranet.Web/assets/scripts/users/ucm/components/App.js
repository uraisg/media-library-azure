import React from 'react'
import { Container } from 'react-bootstrap'
import SearchUser from './@/../../../ucm/components/searchuser'
import styled from "styled-components";
import Users from './@/../../../ucm/components/users'
import { FilterProvider } from './context';
import Page from './@/../../../ucm/components/Pagination'



const Style = styled.div`
    background-color: #f6f6f6;
    display: flex;
    min-height: 100vh;
    height: 100%;
  `


const App = () => {
  return (
    <Style>
      <Container className="mt-3">
        <FilterProvider>
          <SearchUser />
        
          <Users />
          <Page/>
    
    </FilterProvider>
      </Container>
    </Style>
  );
}
export default App
