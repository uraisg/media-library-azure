import Navbar from './@/../../../Layout/Navbar'
import Staff from './@/../../../staff/components/Staff'
import { Container, LeftDiv, RightDiv } from './@/../../../Layout/Component'


const App = () => {
  return (
    <Container>

      <LeftDiv>
        <Navbar
          active="Staff"
        />
      </LeftDiv>

      <RightDiv>
        <Staff />
      </RightDiv>

    </Container>
  )
}

export default App
