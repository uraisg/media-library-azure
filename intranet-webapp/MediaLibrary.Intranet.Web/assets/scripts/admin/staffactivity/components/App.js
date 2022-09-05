import Navbar from './@/../../../Layout/Navbar'
import ActivityReport from './@/../../../staffactivity/components/ActivityReport'
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
        <ActivityReport />
      </RightDiv>

    </Container>
  )
}

export default App
