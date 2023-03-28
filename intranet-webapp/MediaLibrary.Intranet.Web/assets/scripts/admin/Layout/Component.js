import { Pagination } from 'react-bootstrap'

export const Page = (props) => {
  const getPageArr = (currentPage, totalPage) => {
    let maxPageShow = 5
    let pageArr = []

    if (currentPage == 1) {
      for (let i = 1; i <= maxPageShow && i <= totalPage; i++) {
        pageArr.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => handlePage(i)}
          >
            {i}
          </Pagination.Item>
        )
      }
    }
    else if (currentPage == totalPage) {
      for (let i = currentPage - 4; i <= totalPage; i++) {
        if (i < 1) {
          continue
        }

        pageArr.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => handlePage(i)}
          >
            {i}
          </Pagination.Item>
        )
      }
    }
    else {
      for (let i = currentPage - 2; i <= totalPage && i <= currentPage + 2; i++) {
        if (i < 1) {
          continue
        }

        pageArr.push(
          <Pagination.Item
            key={i}
            active={i === currentPage}
            onClick={() => handlePage(i)}
          >
            {i}
          </Pagination.Item>
        )
      }
    }

    if (pageArr.at(0).key != 1) {
      pageArr.push(
        <Pagination.Item
          key={1}
          onClick={() => handlePage(1)}
        >
          1
        </Pagination.Item>
      )

      if (pageArr.at(0).key - 1 != 1) {
        pageArr.push(<Pagination.Item disabled>...</Pagination.Item>)
      }
    }

    if (pageArr.at(-1).key != totalPage) {
      if (pageArr.at(-1).key + 1 != totalPage) {
        pageArr.push(<Pagination.Item disabled>...</Pagination.Item>)
      }
      pageArr.push(
        <Pagination.Item
          key={totalPage}
          onClick={() => handlePage(totalPage)}
        >
          {totalPage}
        </Pagination.Item>
      )
    }

    return pageArr
  }

  let pageArr = getPageArr(props.currentPage, props.totalPage)

  const handlePage = (page) => {
    const temp = { ...props.active, "Page": page }
    props.setActive(temp)
  }

  const handleNext = () => {
    if (props.currentPage + 1 > props.totalPage) {
      return
    }
    const temp = { ...props.active, "Page": props.currentPage+1 }
    props.setActive(temp)
  }

  const handlePrev = () => {
    if (props.currentPage - 1 < 1) {
      return
    }
    const temp = { ...props.active, "Page": props.currentPage-1 }
    props.setActive(temp)
  }

  return (
    <Pagination>
      <Pagination.Item
        disabled={props.currentPage === 1}
        onClick={() => handlePrev()}
      >
        Previous
      </Pagination.Item>
        {pageArr}
      <Pagination.Item
        disabled={props.currentPage === props.totalPage}
        onClick={() => handleNext()}
      >
        Next
      </Pagination.Item>
    </Pagination>
  )
}

export const TableResult = (props) => {
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

  return (
    <div
      className="shadow bg-white rounded mt-2"
    >
      <TopPagination>
        <Page
          currentPage={props.currentPage}
          totalPage={props.totalPage}
          active={props.active}
          setActive={props.setActive}
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
              {props.tableHeader.map((item, index) => (
                <th key={index}>{item}</th>
              ))}
            </tr>
          </thead>
          <tbody id="activityTableBody" className="text-center">
            {props.tableBody}
          </tbody>
        </table>
      </div>

      <hr />

      <BottomPagination>
        <Page
          currentPage={props.currentPage}
          totalPage={props.totalPage}
          active={props.active}
          setActive={props.setActive}
        />
      </BottomPagination>
    </div>
  )
}

export const BackBar = (props) => {
  return (
    <div
      className="p-2 mb-4 border bg-light rounded"
    >
      <a
        className="btn btn-outline-secondary btn-sm ml-2"
        href={props.href}
      >
        Back
      </a>
    </div>
  )
}
