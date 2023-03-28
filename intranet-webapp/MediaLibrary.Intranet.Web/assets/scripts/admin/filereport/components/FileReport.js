import styled from 'styled-components'

import FilterOptions from './@/../../../filereport/components/FilterOptions'
import { useFilter } from './@/../../../filereport/components/Context'
import { TableResult, BackBar } from './@/../../../Layout/Component'

const Image = styled.img`
  height: 80px;
  width: 90px;
`

const FileReport = () => {
  const filterContext = useFilter()

  const tableHeader = ["", "Planning Area", "Name", "Email", "Department", "Group", "Date & Time", "File Size", "View Stats", "Download Stats"]
  const tableBody = filterContext.result.map((item, index) => (
    <tr key={index}>
      <td>
        <a
          href={item.Link}
          target="_blank"
          Add rel="noopener"
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
      <td>{item.FileSize}</td>
      <td>{item.ViewCount}</td>
      <td>{item.DownloadCount}</td>
    </tr>
  ))

  return (
    <>
      <BackBar href="/Admin" />

      <h2
        className="mb-4"
      >
        File Report Statistics
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

export default FileReport
