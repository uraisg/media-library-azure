import Navbar from './@/../../../Layout/Navbar'
import ActivityReport from './@/../../../staffactivity/components/ActivityReport'
import { Container, LeftDiv, RightDiv } from './@/../../../Layout/Component'
import { FilterProvider } from './@/../../../staffactivity/components/Context'

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
          <ActivityReport />
        </FilterProvider>
      </RightDiv>

    </Container>
  )
}

export default App
