import Heading from '@/components/Heading'
import StepperForm from '@/components/Stepper'
import { FileProvider, UploadCompleteProvider, StepCompleteProvider } from '@/components/AllContext'

const App = () => {
  return (
    <FileProvider>
      <UploadCompleteProvider>
        <Heading>
          <StepCompleteProvider>
            <StepperForm />
          </StepCompleteProvider>
        </Heading>
      </UploadCompleteProvider>
    </FileProvider>
  )
}

export default App
