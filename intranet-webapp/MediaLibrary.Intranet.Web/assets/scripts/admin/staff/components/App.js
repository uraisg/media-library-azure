import Navbar from './@/../../../Layout/Navbar'
import Staff from './@/../../../staff/components/Staff'
import { Container, LeftDiv, RightDiv } from './@/../../../Layout/Component'
import { FilterProvider } from './@/../../../staff/components/Context'


const App = () => {
  return (
    <Container>

      <LeftDiv>
        <Navbar
          active="Staff"
        />
      </LeftDiv>

      <RightDiv>
        <FilterProvider>
          <Staff />
        </FilterProvider>
      </RightDiv>

    </Container>
  )
}

export default App
