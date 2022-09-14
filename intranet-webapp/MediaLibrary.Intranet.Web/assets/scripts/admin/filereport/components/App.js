import Navbar from './@/../../../Layout/Navbar'
import FileReport from './@/../../../filereport/components/FileReport'
import { FilterProvider } from './@/../../../filereport/components/Context'
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
        <FilterProvider>
          <FileReport />
        </FilterProvider>
      </RightDiv>

    </Container>
  )
}

export default App
