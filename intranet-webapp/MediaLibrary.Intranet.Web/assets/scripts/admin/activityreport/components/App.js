import AdminLayout from './@/../../../Layout/AdminLayout'
import ActivityReport from './@/../../../activityreport/components/ActivityReport'
import { FilterProvider } from './@/../../../activityreport/components/Context'


const App = () => {
  return (
    <AdminLayout activeNav="Dashboard">
      <FilterProvider>
          <ActivityReport />
        </FilterProvider>
    </AdminLayout>
  )
}

export default App
