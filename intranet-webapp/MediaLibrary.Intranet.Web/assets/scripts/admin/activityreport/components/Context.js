import React, { useState, useContext, useEffect } from 'react'

import { formatDateOnly, formatTimeOnly } from '@/../format'

const FilterContext = React.createContext()

export const useFilter = () => {
    return useContext(FilterContext)
}

export const FilterProvider = ({ children }) => {
    const [active, setActive] = useState({
        ActivityOption: 0,
        SortOption: "dateDSC",
        PlanningArea: "ALL",
        StartDate: "",
        EndDate: "",
        Page: 1,
        Email: ""
    })
    const [result, setResult] = useState([])
    const [page, setPage] = useState({ CurrentPage: 1, TotalPage: 1 })
    const [area, setArea] = useState([])

    //Get Result
    useEffect(() => {
        const baseLocation = location
        let url = new URL('/api/activityreport', baseLocation)
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
                handleResult(result.Result)
                handlePage(result.TotalPage, result.CurrentPage)
            })
            .catch((error) => {
                console.log("Error: " + error);
            })

        const handleResult = (data) => {
            let allResult = []
            data.forEach(item => {
                //Display location if it is geotag
                let location = "-"
                if (item.Location.length != 0) {
                    location = item.Location[0]
                }

                //store all data needed into array
                const resultItem = {
                    Image: item.ThumbnailURL,
                    Link: '/gallery/item/' + item.FileId,
                    Location: location,
                    Name: item.StaffName,
                    Email: item.Email,
                    Department: item.Department,
                    Group: "(Group)",
                    DateTime: `${formatDateOnly(item.ActivityDateTime)} ${formatTimeOnly(item.ActivityDateTime)}`,
                    ActivityType: item.ActivityType
                }

                allResult.push(resultItem)
            })

            setResult(allResult)
        }

        const handlePage = (totalPage, currentPage) => {
          setPage({ CurrentPage: currentPage, TotalPage: totalPage })
        }
    }, [active])

    //Get Planning Area
    useEffect(() => {
        const convertPlanningArea = (regionId) => {
            switch (regionId) {
                case 1:
                    return "North Region"
                case 2:
                    return "East Region"
                case 3:
                    return "West Region"
                case 4:
                    return "Central Region"
                case 5:
                    return "North-East Region"
                case 6:
                    return "Central Area Region"
            }
        }

        fetch('/api/planningarea', {
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
            .then((data) => {
                let p_area = []
                let all_region_id = []
                //Insert data into select
                data.forEach(e => {
                    const planningAreaName = e["PlanningAreaName"].trim()

                    let regionId = e["RegionId"]
                    if (regionId == 4 && e["CA_IND"] == 1) {
                        regionId = 6
                    }

                    if (!all_region_id.includes(regionId)) {
                        all_region_id.push(regionId)
                    }

                    let area = {}
                    area[regionId] = planningAreaName
                    p_area.push(area)
                })

                let sortedArea = []
                all_region_id.forEach((regionId) => {
                  const planningArea = p_area.filter((area) => Object.keys(area) == regionId)
                  let areaArr = []
                  planningArea.forEach((area) => {
                      areaArr.push(area[regionId])
                  })
                  let obj = {}
                  obj["Region"] = convertPlanningArea(regionId)
                  obj["PlanningArea"] = areaArr
                  sortedArea.push(obj)
                })

                setArea(sortedArea)
            })
    }, [])

    return (
        <FilterContext.Provider value={{ active: active, setActive: setActive, result: result, setResult: setResult, page: page, area: area }}>
            {children}
        </FilterContext.Provider>
    )
}
