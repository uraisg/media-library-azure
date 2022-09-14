import { Dropdown } from 'react-bootstrap'
import { ThreeDotsVertical } from 'react-bootstrap-icons'

import SearchStaff from './@/../../../staff/components/SearchStaff'
import { TableResult } from './@/../../../Layout/Component'
import { useFilter } from './@/../../../staff/components/Context'

const Staff = () => {
  const filterContext = useFilter()

  const tableHeader = ["Name", "Email", "Department", "Group", "Upload Stats", "Download Stats", ""]
  const tableBody = filterContext.result.map((item, index) => (
    <tr key={index}>
      <td>{item.StaffName}</td>
      <td>{item.Email}</td>
      <td>{item.Department}</td>
      <td>{item.Group}</td>
      <td>{item.UploadCount}</td>
      <td>{item.DownloadCount}</td>
      <td>
        <Dropdown style={{ marginTop: "-8px" }}>
          <Dropdown.Toggle variant="">
            <ThreeDotsVertical />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => handleActivityReport(item.Email)}>Activity Report</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </td>
    </tr>
  ))

  const handleActivityReport = (email) => {
    const baseLocation = location
    let url = new URL('/Admin/StaffActivityReport', baseLocation)

    const params = {
      Email: encodeURIComponent(email)
    }

    url.search = new URLSearchParams(params)

    window.location.href = url
  }

  return (
    <>
      <SearchStaff />
      <TableResult
        tableHeader={tableHeader}
        tableBody={tableBody}
        currentPage={filterContext.page.CurrentPage}
        totalPage={filterContext.page.TotalPage}
        active={filterContext.active}
        setActive={filterContext.setActive}
      />
    </>
  )
}

export default Staff
