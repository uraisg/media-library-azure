import styled from 'styled-components'
import { Dropdown, Button } from 'react-bootstrap'
import { Download } from 'react-bootstrap-icons'
import React, { useState, useEffect } from 'react'

import DashboardCard from './@/../../../dashboard/components/DashboardCard'
import DashboardChart from './@/../../../dashboard/components/DashboardChart'

const Top = styled.div`
  display: flex;
`

const TopDiv = styled.div`
  width: 50%;
`

const Card = styled.div`
  display: flex;
  margin-top: 2%;

  @media only screen and (max-width: 799px) {
      display: block;
  }
`

const Charts = styled.div`
  display: flex;
  align-items: flex-start;
  margin-top: 1.5rem;

  @media only screen and (max-width: 799px) {
      display: block;
  }
`

const Dashboard = () => {
  const [active, setActive] = useState("ALL")
  const [area, setArea] = useState([])

  let currentYear = new Date().getFullYear()
  const [firstYear, setFirstYear] = useState([currentYear])
  const [card, setCard] = useState({ Upload: 0, AvgFileSize: 0, Download: 0, Selected: currentYear })
  const [fileSize, setFileSize] = useState({ Key: [], Count: [], Selected: currentYear })
  const [activity, setActivity] = useState({ Month: [], Upload: [], Download: [] })
  const [uploadComparison, setUploadComparison] = useState({ Month: [], Current: [], Past: [] })
  const [downloadComparison, setDownloadComparison] = useState({ Month: [], Current: [], Past: [] })
  const [viewStats, setViewStats] = useState([])

  //Fetch all planning area
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

  //Fetch Dashboard Result
  useEffect(() => {
    const currentYear = new Date().getFullYear()

    setFirstYear([currentYear])
    
    const graphActivityUpload = (year) => {
      return fetch(`/api/activity/graph/upload/${active}/${year}`, {
        mode: 'same-origin',
        credentials: 'same-origin',
      })
    }

    const graphActivityDownload = (year) => {
      return fetch(`/api/activity/graph/download/${active}/${year}`, {
        mode: 'same-origin',
        credentials: 'same-origin',
      })
    }

    let cardActivity = fetch(`/api/activity/card/${active}`, {
      mode: 'same-origin',
      credentials: 'same-origin',
    })

    let fileSize = fetch(`/api/filedetails/filesize/${active}/${currentYear}`, {
      mode: 'same-origin',
      credentials: 'same-origin',
    })

    let graphUpload = graphActivityUpload(currentYear)

    let graphDownload = graphActivityDownload(currentYear)

    Promise.all([cardActivity, fileSize, graphUpload, graphDownload])
      .then(results => {
        //Card
        results[0].json()
          .then(data => {
            const uploadCount = data.uploadCount
            const downloadCount = data.downloadCount
            const fileSizeAvg = data.fileSizeAvg
            const year = data.firstYear

            setCard({ Upload: uploadCount, AvgFileSize: fileSizeAvg, Download: downloadCount, Selected: currentYear })

            for (let i = firstYear[0] - 1; i >= year; i--) {
              setFirstYear(temp => [...temp, i])
            }
          })

        //File Size
        results[1].json()
          .then(data => {
            let key = []
            let count = []

            data.forEach(fileSize => {
              key.push(fileSize.FileSize + "mb-" + (parseInt(fileSize.FileSize) + 1).toString() + "mb")
              count.push(fileSize.Count)
            })

            setFileSize({ Key: key, Count: count, Selected: currentYear })
          })

        //Activity Graph
        results[2].json()
          .then(data => {
            results[3].json()
              .then(data2 => {
                const dataMonth = getMonthArray(data, data2)
                const dataCountUpload = getCountArray(dataMonth, data)
                const dataCountDownload = getCountArray(dataMonth, data2)

                setActivity({ Month: dataMonth, Upload: dataCountUpload, Download: dataCountDownload })
              })
          })
      })

    let currUploadComparison = graphActivityUpload(currentYear)
    let pastUploadComparison = graphActivityUpload(currentYear - 1)

    let currDownloadComparison = graphActivityDownload(currentYear)
    let pastDownloadComparison = graphActivityDownload(currentYear - 1)

    let viewCount = fetch(`/api/dashboardActivity/viewcount/${active}`, {
      mode: 'same-origin',
      credentials: 'same-origin',
    })

    Promise.all([currUploadComparison, pastUploadComparison, currDownloadComparison, pastDownloadComparison, viewCount])
      .then(results => {
        //Upload Comparison
        results[0].json()
          .then(data => {
            results[1].json()
              .then(data2 => {
                const dataMonth = getMonthArray(data, data2)
                const dataCount = getCountArray(dataMonth, data)
                const data2Count = getCountArray(dataMonth, data2)

                setUploadComparison({ Month: dataMonth, Current: dataCount, Past: data2Count })
              })
          })

        //Download Comparison
        results[2].json()
          .then(data => {
            results[3].json()
              .then(data2 => {
                const dataMonth = getMonthArray(data, data2)
                const dataCount = getCountArray(dataMonth, data)
                const data2Count = getCountArray(dataMonth, data2)

                setDownloadComparison({ Month: dataMonth, Current: dataCount, Past: data2Count })
              })
          })

        //View Stats
        results[4].json()
          .then(data => {
            setViewStats([])
            let apiFetchURL = []
            data.forEach(e => {
              apiFetchURL.push(fetch(`/api/media/${e.FileId}`, {
                mode: 'same-origin',
                credentials: 'same-origin',
              }))
            })
            Promise.all(apiFetchURL)
              .then(async projectname => {
                for (let i = 0; i < apiFetchURL.length; i++) {
                  await generateViewCountTable(projectname[i].json(), data[i])
                }
              })
          })
        //generateViewCount(results[4].json())
      })

    const convertMonth = (month) => {
      switch (month) {
        case 1:
          return "January"
        case 2:
          return "February"
        case 3:
          return "March"
        case 4:
          return "April"
        case 5:
          return "May"
        case 6:
          return "June"
        case 7:
          return "July"
        case 8:
          return "August"
        case 9:
          return "September"
        case 10:
          return "October"
        case 11:
          return "November"
        case 12:
          return "December"
      }
    }

    const getMonthArray = (array1, array2) => {
      let allMonth = []

      if (array1.length == 0 && array2.length == 0) {
        return allMonth
      }

      array1.forEach(e => {
        if (!allMonth.includes(e.Month)) {
          allMonth.push(e.Month)
        }
      })
      array2.forEach(e => {
        if (!allMonth.includes(e.Month)) {
          allMonth.push(e.Month)
        }
      })
      allMonth = allMonth.sort(function (a, b) {
        return a - b;
      })
      for (let i = 0; i < allMonth.length; i++) {
        allMonth[i] = convertMonth(allMonth[i])
      }

      return allMonth
    }

    const getCountArray = (array1, array2) => {
      let arr = []

      if (array1.length == 0 || array2.length == 0) {
        return arr
      }

      for (let i = 0; i < array1.length; i++) {
        let found = false
        for (let j = 0; j < array2.length; j++) {
          if (array1[i] == convertMonth(array2[j].Month)) {
            arr.push(array2[j].Count)
            found = true
            break
          }
        }
        if (!found) {
          arr.push(0)
        }
      }

      return arr
    }

    const generateViewCountTable = async (allKey, data) => {
      await allKey.then(key => {
        let obj = {}
        obj["Name"] = key.Project
        obj["View"] = data.ViewCount

        setViewStats(temp => [...temp, obj])
      })
    }

    
  }, [active])

  const handleSelect = (planningArea) => {
    setActive(planningArea)
  }

  return (
    <>
      <Top>
        <TopDiv>
          <Dropdown>
            <Dropdown.Toggle className="border border-primary" variant="" size="sm">
              Planning Area: {active}
            </Dropdown.Toggle>

            <Dropdown.Menu
              style={{height: "350px", overflow: "auto"}}
            >
              <Dropdown.Item
                style={active == "ALL" ? { backgroundColor: "rgb(227, 230, 228)" } : { backgroundColor: "white" }}
                onClick={() => setActive("ALL")}
              >
                ALL
              </Dropdown.Item>
              <Dropdown.Divider />

              {area.map((item, key) => (
                <React.Fragment key={key}>
                  <h6 className="ml-2">{item.Region}</h6>

                  {item.PlanningArea.map((pArea, index) => (
                    <Dropdown.Item
                      key={index}
                      style={active == pArea ? { backgroundColor: "rgb(227, 230, 228)" } : { backgroundColor: "white" }}
                      onClick={() => setActive(pArea)}
                    >
                      {pArea}
                    </Dropdown.Item>
                  ))}

                </React.Fragment>
              ))}

            </Dropdown.Menu>
          </Dropdown>
        </TopDiv>

        <TopDiv>
          <Button className="genBtn" size="sm" variant="">
            <a
              download
              href="/api/generatereport"
              className="text-decoration-none text-dark"
            >
              <Download
                size={18}
                className="mr-1"
              />
              Generate Excel
            </a>
          </Button>
        </TopDiv>
      </Top>

      <Card>
        <DashboardCard
          card={card}
        />
      </Card>

      <Charts>
        <DashboardChart
          planningArea={active}
          fileSize={fileSize}
          setFileSize={setFileSize}
          firstYear={firstYear}
          activity={activity}
          setActivity={setActivity}
          uploadComparison={uploadComparison}
          downloadComparison={downloadComparison}
          viewStats={viewStats}
        />
      </Charts>
    </>
  )
}

export default Dashboard
