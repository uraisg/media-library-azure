import styled from 'styled-components'

import { TableResult, BackBar } from './@/../../../Layout/Component'
import FilterOptions from './@/../../../activityreport/components/FilterOptions'
import { useFilter } from './@/../../../activityreport/components/Context'


const Image = styled.img`
  height: 80px;
  width: 90px;
`

const ActivityReport = () => {
  const filterContext = useFilter()

  const tableHeader = ["", "Planning Area", "Name", "Email", "Department", "Group", "Date & Time", "Activity"]
  const tableBody = filterContext.result.map((item, index) => {
    return (
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
        <td>{item.Name}</td>
        <td>{item.Email}</td>
        <td>{item.Department}</td>
        <td>{item.Group}</td>
        <td>{item.DateTime}</td>
        <td>{item.ActivityType}</td>
      </tr>
    )
  })

  return (
    <>
      <BackBar href="/Admin" />

      <h2
        className="mb-4"
      >
        Activity Report Statistics
      </h2>

      
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
