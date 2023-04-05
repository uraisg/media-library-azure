import React from 'react'
import User from './@/../../../ucm/components/users'
import { Container } from 'react-bootstrap'
import SearchUser from './@/../../../ucm/components/searchuser'
import styled from "styled-components";

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
        <SearchUser />
        <User />
      </Container>
    </Style>
  );
}
export default App
