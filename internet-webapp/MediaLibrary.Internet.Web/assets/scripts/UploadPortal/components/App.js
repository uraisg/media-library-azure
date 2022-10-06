import Heading from '@/components/Heading'
import StepperForm from '@/components/Stepper'
import { FormProvider, StepCompleteProvider } from '@/components/AllContext'

const App = () => {
  return (
    <FormProvider>
        <Heading>
          <StepCompleteProvider>
            <StepperForm />
          </StepCompleteProvider>
        </Heading>
    </FormProvider>
  )
}

export default App
