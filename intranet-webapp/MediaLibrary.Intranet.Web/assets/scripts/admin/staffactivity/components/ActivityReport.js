import Topbar from './@/../../../staffactivity/components/Topbar'
import { FilterProvider } from './@/../../../staffactivity/components/Context'
import FilterOptions from './@/../../../staffactivity/components/FilterOptions'
import TableResult from './@/../../../staffactivity/components/TableResult'

const ActivityReport = () => {
  const email = document.getElementById("email").value

  return (
    <>
      <Topbar />

      <h2 className="mb-4">Activity Report Statistics</h2>
      <h5></h5>
      <h5>{email}</h5>
      <h5></h5>
      <h5 className="mb-4"></h5>

      <FilterProvider>
        <FilterOptions />
        <TableResult />
      </FilterProvider>
    </>
  )
}

export default ActivityReport
