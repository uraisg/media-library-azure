import React from 'react'
import { Dropdown } from 'react-bootstrap'
import { ThreeDotsVertical } from 'react-bootstrap-icons'

import { Page } from './@/../../../Layout/Component'
import { useFilter } from './@/../../../staff/components/Context'

const TopPagination = ({ children }) => {
  return (
    <div
      className="pt-3 pb-1 pr-4 justify-content-end d-flex"
    >
      {children}
    </div>
  )
}

const BottomPagination = ({ children }) => {
  return (
    <div
      className="p-1 pr-4 justify-content-end d-flex"
    >
      {children}
    </div>
  )
}

const handleActivityReport = (email) => {
  const baseLocation = location
  let url = new URL('/Admin/StaffActivityReport', baseLocation)

  const params = {
    Email: encodeURIComponent(email)
  }

  url.search = new URLSearchParams(params)

  window.location.href = url
}

const TableResult = () => {
  const filterContext = useFilter()

  return (
    <div
      className="shadow bg-white rounded mt-2"
    >
      <TopPagination>
        <Page
          currentPage={filterContext.page.CurrentPage}
          totalPage={filterContext.page.TotalPage}
          active={filterContext.active}
          setActive={filterContext.setActive}
        />
      </TopPagination>

      <hr className="hrNegativeMargin" />

      <div className="p-2">
        <table
          className="table table-striped table-borderless table-responsive-lg table-sm"
          width="100%"
          id="activityTable"
          aria-labelledby="activityTable"
        >
          <thead>
            <tr align="center">
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Group</th>
              <th>Upload Stats</th>
              <th>Download Stats</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="activityTableBody" className="text-center">
            {filterContext.result.map((item, index) => (
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
            ))}
          </tbody>
        </table>
      </div>

      <hr />

      <BottomPagination>
        <Page
          currentPage={filterContext.page.CurrentPage}
          totalPage={filterContext.page.TotalPage}
          active={filterContext.active}
          setActive={filterContext.setActive}
        />
      </BottomPagination>
    </div>
  )
}

export default TableResult
