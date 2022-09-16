import AdminLayout from './@/../../../Layout/AdminLayout'
import Staff from './@/../../../staff/components/Staff'
import { FilterProvider } from './@/../../../staff/components/Context'


const App = () => {
  return (
  <AdminLayout activeNav="Staff">
    <FilterProvider>
      <Staff />
    </FilterProvider>
  </AdminLayout>
  )
}

export default App
