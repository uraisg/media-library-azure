import styled from 'styled-components'

import Topbar from './@/../../../staffactivity/components/Topbar'
import { useFilter } from './@/../../../staffactivity/components/Context'
import FilterOptions from './@/../../../staffactivity/components/FilterOptions'
import { TableResult } from './@/../../../Layout/Component'

const Image = styled.img`
  height: 80px;
  width: 90px;
`

const ActivityReport = () => {
  const email = document.getElementById("email").value
  const filterContext = useFilter()

  const tableHeader = ["", "Planning Area", "Date & Time", "Activity"]
  const tableBody = filterContext.result.map((item, index) => (
    <tr key={index}>
      <td>
        <a
          href={item.Link}
          target="_blank"
        >
          <Image src={item.Image} />
        </a>
      </td>
      <td>{item.Location}</td>
      <td>{item.DateTime}</td>
      <td>{item.ActivityType}</td>
    </tr>
  ))

  return (
    <>
      <Topbar />

      <h2 className="mb-4">Activity Report Statistics</h2>
      <h5></h5>
      <h5>{email}</h5>
      <h5></h5>
      <h5 className="mb-4"></h5>

      
      <FilterOptions />
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

export default ActivityReport
