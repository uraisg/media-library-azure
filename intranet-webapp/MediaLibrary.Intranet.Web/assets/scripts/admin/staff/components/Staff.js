import SearchStaff from './@/../../../staff/components/SearchStaff'
import TableResult from './@/../../../staff/components/TableResult'
import { FilterProvider } from './@/../../../staff/components/Context'

const Staff = () => {
  return (
    <FilterProvider>
      <SearchStaff />
      <TableResult />
    </FilterProvider>
  )
}

export default Staff
