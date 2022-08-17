import React from 'react'
import styled from 'styled-components'

import { Page } from './@/../../../Layout/Component'
import { useFilter } from './@/../../../filereport/components/Context'

const TopPagination = ({ children }) => {
  return (
    <div
      className="pt-3 pb-1 pr-4 justify-content-end d-flex"
    >
      { children }
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

const Image = styled.img`
  height: 80px;
  width: 90px;
`

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
              <th></th>
              <th>Planning <br /> Area</th>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Group</th>
              <th>Date &amp; Time</th>
              <th>File Size(mb)</th>
              <th>View Stats</th>
              <th>Download Stats</th>
            </tr>
          </thead>
          <tbody id="activityTableBody" className="text-center">
            {filterContext.result.map((item, index) => (
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
                <td>{item.FileSize}</td>
                <td>{item.ViewCount}</td>
                <td>{item.DownloadCount}</td>
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
