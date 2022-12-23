import StepperForm from '@/components/Stepper'
import { FormProvider, StepCompleteProvider } from '@/components/AllContext'

const App = () => {
  return (
    <div className="container mt-4">
      <h1>Upload Media</h1>
      <FormProvider>
        <StepCompleteProvider>
          <StepperForm />
        </StepCompleteProvider>
      </FormProvider>
    </div>
  )
}

export default App
