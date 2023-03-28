import AdminLayout from './@/../../../Layout/AdminLayout'
import ActivityReport from './@/../../../staffactivity/components/ActivityReport'
import { FilterProvider } from './@/../../../staffactivity/components/Context'

const App = () => {
  return (
  <AdminLayout activeNav="Staff">
    <FilterProvider>
      <ActivityReport />
    </FilterProvider>
  </AdminLayout>
  )
}

export default App
