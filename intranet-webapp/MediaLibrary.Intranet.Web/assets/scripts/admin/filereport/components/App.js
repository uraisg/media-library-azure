import AdminLayout from './@/../../../Layout/AdminLayout'
import FileReport from './@/../../../filereport/components/FileReport'
import { FilterProvider } from './@/../../../filereport/components/Context'

const App = () => {
  return (
  <AdminLayout activeNav="Dashboard">
    <FilterProvider>
      <FileReport />
    </FilterProvider>
  </AdminLayout>
  )
}

export default App
