import Navbar from './@/../../../Layout/Navbar'
import Dashboard from './@/../../../dashboard/components/Dashboard'
import { Container, LeftDiv, RightDiv } from './@/../../../Layout/Component'


const App = () => {
  return (
    <Container>

      <LeftDiv>
        <Navbar
          active="Dashboard"
        />
      </LeftDiv>

      <RightDiv>
        <Dashboard />
      </RightDiv>

    </Container>
  )
}

export default App
