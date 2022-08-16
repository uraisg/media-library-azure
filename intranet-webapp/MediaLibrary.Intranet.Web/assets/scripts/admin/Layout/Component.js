import styled from 'styled-components'
import { Pagination } from 'react-bootstrap'

export const Container = styled.div`
    background-color: #f0f5f3;
    display: flex;
    min-height: 100vh;
    height: 100%;
  `

export const LeftDiv = styled.div`
  width: 20%;

  @media only screen and (max-width: 1199px) {
      width: 15%;
  }
`

export const RightDiv = styled.div`
  width: 100%;
  padding: 1%;

  @media only screen and (max-width: 1399px) {
      width: 90%;
  }

  @media only screen and (max-width: 1199px) {
      width: 105%;
  }

  @media only screen and (max-width: 859px) {
      width: 100%;
  }

  @media only screen and (max-width: 799px) {
      width: 90%;
  }
`



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
