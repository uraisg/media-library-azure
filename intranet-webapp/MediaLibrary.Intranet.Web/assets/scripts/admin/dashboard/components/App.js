import AdminLayout from './@/../../../Layout/AdminLayout'
import Dashboard from './@/../../../dashboard/components/Dashboard'

const App = () => {
  return (
    <AdminLayout activeNav="Dashboard">
      <Dashboard />
    </AdminLayout>
  )
}

export default App
