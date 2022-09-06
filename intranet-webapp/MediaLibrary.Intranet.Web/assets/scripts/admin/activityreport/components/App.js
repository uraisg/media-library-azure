import Navbar from './@/../../../Layout/Navbar'
import ActivityReport from './@/../../../activityreport/components/ActivityReport'
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
        <ActivityReport />
      </RightDiv>

    </Container>
  )
}

export default App
