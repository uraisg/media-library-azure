import React, { useContext, useState, useEffect } from 'react'

const FilterContext = React.createContext()

export const useFilter = () => {
  return useContext(FilterContext)
}

export const FilterProvider = ({ children }) => {
  const [active, setActive] = useState({
    Page: 1,
    SearchQuery: "",
    SortOption: "uploadDSC"
  })
  const [result, setResult] = useState([])
  const [page, setPage] = useState({ CurrentPage: 1, TotalPage: 1 })

  useEffect(() => {
    const baseLocation = location
    let url = new URL('/api/staff', baseLocation)
    url.search = new URLSearchParams(active)

    fetch(url, {
      mode: 'same-origin',
      credentials: 'same-origin',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`)
        }
        const contentType = response.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          throw new TypeError("Oops, we haven't got JSON!")
        }
        return response.json()
      })
      .then((result) => {
        handleResult(result.Item1)
        handlePage(result.Item2, result.Item3)
      })

    const handleResult = (data) => {
      let allResult = []
      data.forEach((item) => {
        const resultItem = {
          StaffName: item.StaffName,
          Email: item.Email,
          Department: item.Department,
          Group: "(Group)",
          UploadCount: item.UploadCount,
          DownloadCount: item.DownloadCount
        }

        allResult.push(resultItem)
      })

      setResult(allResult)
    }

    const handlePage = (totalPage, currentPage) => {
      setPage({ CurrentPage: currentPage, TotalPage: totalPage })
    }
  }, [active])

  return (
    <FilterContext.Provider value={{ active: active, setActive: setActive, result: result, setResult: setResult, page: page, setPage: setPage }}>
      {children}
    </FilterContext.Provider>
  )
}
