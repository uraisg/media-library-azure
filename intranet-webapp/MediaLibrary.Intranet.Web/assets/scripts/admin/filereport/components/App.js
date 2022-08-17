import Navbar from './@/../../../Layout/Navbar'
import FileReport from './@/../../../filereport/components/FileReport'
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
        <FileReport />
      </RightDiv>

    </Container>
  )
}

export default App
