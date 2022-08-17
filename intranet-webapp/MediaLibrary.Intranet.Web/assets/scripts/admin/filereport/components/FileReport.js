import Topbar from './@/../../../filereport/components/Topbar'
import { FilterProvider } from './@/../../../filereport/components/Context'
import FilterOptions from './@/../../../filereport/components/FilterOptions'
import TableResult from './@/../../../filereport/components/TableResult'

const FileReport = () => {
  return (
    <>
      <Topbar />

      <h2
        className="mb-4"
      >
        File Report Statistics
      </h2>

      <FilterProvider>
        <FilterOptions />
        <TableResult />
      </FilterProvider>
    </>
  )
}

export default FileReport
