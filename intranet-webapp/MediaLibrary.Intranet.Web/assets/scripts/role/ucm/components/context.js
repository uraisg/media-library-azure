import React, { useContext, useState, useEffect } from 'react'

const FilterContext = React.createContext()

export const useFilter = () => {
  return useContext(FilterContext)
}

export const FilterProvider = ({ children }) => {
  const [active, setActive] = useState({
    Page: 1,
    pagelimit: 10,
    currPageCount: 0,
    SearchQuery: "",
    SortOption: "dateDSC",
    StartDate: "",
    EndDate: "",
    filterbydepartment: [],
    filterbygroup: [],
    filterbyrole: [],
  })

  const [result, setResult] = useState([])
  const [page, setPage] = useState({ CurrentPage: 1, TotalPage: 1 })

  useEffect(() => {
    const baseLocation = location
    let url = new URL('/api/acm/usersRole', baseLocation)
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
        handlePage(result.Item2)
      })

    const handleResult = (data) => {
      let allResult = []
      data.forEach((item) => {

        const resultItem = {
          id: item.id,
          name: item.name,
          email: item.email,
          Department: item.department,
          group: item.group,
          role: item.role,
          LastLoginDate: item.LastLoginDate,
        }
        allResult.push(resultItem)
      })
      setResult(allResult)
    }
    
    const handlePage = (totalPage) => {
      setPage({ TotalPage: totalPage })
    }
    
}, [active])
  

  return (
    <FilterContext.Provider value={{ active: active, setActive: setActive, result: result, setResult: setResult, page: page, setPage: setPage }}>
      {children}
    </FilterContext.Provider>
  )
}
