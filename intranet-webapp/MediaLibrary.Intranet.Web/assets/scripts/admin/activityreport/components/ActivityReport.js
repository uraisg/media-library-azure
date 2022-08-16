import Topbar from './@/../../../activityreport/components/Topbar'
import { FilterProvider } from './@/../../../activityreport/components/Context'
import FilterOptions from './@/../../../activityreport/components/FilterOptions'
import TableResult from './@/../../../activityreport/components/TableResult'

const ActivityReport = () => {
  return (
    <>
      <Topbar />

      <h2
        className="mb-4"
      >
        Activity Report Statistics
      </h2>

      <FilterProvider>
        <FilterOptions />
        <TableResult />
      </FilterProvider>
    </>
  )
}

export default ActivityReport
