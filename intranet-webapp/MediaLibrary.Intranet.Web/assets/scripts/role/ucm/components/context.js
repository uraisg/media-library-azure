import React, { useContext, useState, useEffect } from 'react'

const FilterContext = React.createContext()

export const useFilter = () => {
  return useContext(FilterContext)
}

export const FilterProvider = ({ children }) => {
  const [active, setActive] = useState({
    Page: 1,
    SearchQuery: "",
    SortOption: "dateDSC",
    StartDate: "",
    EndDate: "",
    filterbydepartment: [],
    filterbygroup: [],
    filterbyrole: [],
    filterbypermission: []
  })

  const [result, setResult] = useState([])
  const [page, setPage] = useState({ CurrentPage: 1, TotalPage: 1 })

 /*
  useEffect(() => {
    setResult([{
      id: "1",
      name: "User1",
      email: "userone@april.biz",
      Department: "ISGG",
      Status: "Active",
      LastLoginDate: "03/28/2023",
    },
    {
      id: "2",
      name: "usertwo ",
      email: "userone@april.biz",
      Department: "ISGG",
      Status: "Active",
      LastLoginDate: "03/28/2023",
    },
    {
      id: "3",
      name: "Clementine ",
      email: "Clementine@april.biz",
      Department: "ISGG",
      Status: "Inactive",
      LastLoginDate: "03/28/2022",
    },

    ])
  }, [active])
  */
  useEffect(() => {
    setResult([{
      id: "1",
      name: "User1",
      email: "userone@april.biz",
      Department: "ISGG",
      Group: "Group1",
      role: "User",
      permission :"Restricted",
      LastLoginDate: "03/28/2023",
    },
    {
      id: "2",
      name: "usertwo ",
      email: "userone@april.biz",
      Department: "ISGG",
      Group: "Group1",
      role: "SystemAdmin",
      permission :"Regular",
      LastLoginDate: "03/28/2023",
    },
    {
      id: "3",
      name: "Clementine ",
      email: "Clementine@april.biz",
      Department: "ISGG",
      Group: "Group1",
      role: "RoleAdmin",
      permission :"Regular",
      LastLoginDate: "03/28/2022",
    },
    {
      id: "4",
      name: "Patricia ",
      email: "Patricia@april.biz",
      Department: "ISGG",
      Group: "Group1",
      role: "User",
      permission :"Restricted",
      LastLoginDate: "03/28/2022",
      },
    {
      id: "5",
      name: "Chelsey ",
      email: "Chelsey@april.biz",
      Department: "ISGG",
      Group: "Group1",
      role: "User",
      permission :"Restricted",
      LastLoginDate: "03/28/2022",
      },])
  }, [])

  const callapi = () => {
    setResult([{
      id: "1",
      name: "User1",
      email: "userone@april.biz",
      Department: "ISGG",
      Group: "Group1",
      role: "User",
      permission:"Restricted",
      LastLoginDate: "03/28/2023",
    },
    {
      id: "2",
      name: "usertwo ",
      email: "userone@april.biz",
      Department: "ISGG",
      Group: "Group1",
      role: "System Admin",
      permission:"Regular",
      LastLoginDate: "03/28/2023",
    },

    ])
  }

  /*
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

  }, [active])*/

  return (
    <FilterContext.Provider value={{ active: active, setActive: setActive, result: result, setResult: setResult, page: page, setPage: setPage,callapi:callapi }}>
      {children}
    </FilterContext.Provider>
  )
}
