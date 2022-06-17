import {
  Chart,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
} from 'chart.js';
import { setAdminNav } from './DisplayAdminNav'

Chart.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  BarController,
  BubbleController,
  DoughnutController,
  LineController,
  PieController,
  PolarAreaController,
  RadarController,
  ScatterController,
  CategoryScale,
  LinearScale,
  LogarithmicScale,
  RadialLinearScale,
  TimeScale,
  TimeSeriesScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  SubTitle
);

//Declare Navbar Active
setAdminNav("dashboard")


//Variables --------------------------------
let allPlanningArea = document.getElementById("allPlanningArea")
let planningAreaSelected = document.getElementById("planningAreaSelected")
let activityFilter = document.querySelector("#activityYearFilter")
let fileSizeFilter = document.querySelector("#fileSizeYearFilter")
let viewTop = document.querySelector("#viewTop")

const uaReport = document.getElementById('UA_Report').getContext('2d');
const fsReport = document.getElementById('FS_Report').getContext('2d');
const upCompare = document.getElementById('UP_Compare').getContext('2d');
const downCompare = document.getElementById('DOWN_Compare').getContext('2d');
let uaChart;
let fsChart;
let upCompChart;
let downCompChart;


//Retrieve Api Fetch --------------------------------
function graphActivityUpload(planningArea, year) {
  return fetch(`/api/activity/graph/upload/${planningArea}/${year}`, {
    mode: 'same-origin',
    credentials: 'same-origin',
  })
}

function graphActivityDownload(planningArea, year) {
  return fetch(`/api/activity/graph/download/${planningArea}/${year}`, {
    mode: 'same-origin',
    credentials: 'same-origin',
  })
}

function chartFileSize(planningArea, year) {
  return fetch(`/api/filedetails/filesize/${planningArea}/${year}`, {
    mode: 'same-origin',
    credentials: 'same-origin',
  })
}


//Render entire Dashboard --------------------------------
function dashboardAPICalls(planningArea, year) {
  clearYearDropDown()
  //Check planning area and retrieve data
  //render the data
  let cardActivity = fetch(`/api/activity/card/${planningArea}`, {
    mode: 'same-origin',
    credentials: 'same-origin',
  })

   planningAreaSelected.innerHTML = planningArea
   planningAreaSelected.dataset.planningArea = planningArea

  let fileSize = chartFileSize(planningArea, year)

  let graphUpload = graphActivityUpload(planningArea, year)

  let graphDownload = graphActivityDownload(planningArea, year)

  Promise.all([cardActivity, fileSize, graphUpload, graphDownload])
    .then(results => {
      generateCardActivity(results[0].json(), year)
      generateFileSize(results[1].json())
      generateGraphActivity(results[2].json(), results[3].json(), "bar")
    })

  let currUploadComparison = graphActivityUpload(planningArea, year)
  let pastUploadComparison = graphActivityUpload(planningArea, year - 1)

  let currDownloadComparison = graphActivityDownload(planningArea, year)
  let pastDownloadComparison = graphActivityDownload(planningArea, year - 1)

  let viewCount = fetch(`/api/dashboardActivity/viewcount/${planningArea}`, {
    mode: 'same-origin',
    credentials: 'same-origin',
  })

  Promise.all([currUploadComparison, pastUploadComparison, currDownloadComparison, pastDownloadComparison, viewCount])
    .then(results => {
      generateUploadComparison(results[0].json(), results[1].json())
      generateDownloadComparison(results[2].json(), results[3].json())
      generateViewCount(results[4].json())
    })
}


//Mini Functions --------------------------------
function getRegionName(regionId) {
  switch (parseInt(regionId)) {
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
      return "Central Area"
  }
}

function planningAreaDropDown() {
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


      let a = document.createElement("a")
      a.classList.add("dropdown-item")
      a.classList.add("planning-area-item")
      a.classList.add("pl-2")
      if ( planningAreaSelected.dataset.planningArea == "ALL") {
        a.style.backgroundColor = "rgb(227, 230, 228)"
      }
      a.innerHTML = "ALL"
      a.dataset.planningArea = "ALL"
      allPlanningArea.appendChild(a)
      for (let i = 0; i < all_region_id.length; i++) {
        let h6 = document.createElement("h6")
        h6.classList.add("dropdown-header")
        h6.classList.add("planning-area-header")
        h6.classList.add("pl-2")
        h6.innerHTML = getRegionName(all_region_id[i])
        allPlanningArea.appendChild(h6)

        for (let j = 0; j < p_area.length; j++) {
          if (Object.keys(p_area[j]) == all_region_id[i]) {
            a = document.createElement("a")
            a.classList.add("dropdown-item")
            a.classList.add("planning-area-item")
            if (Object.values(p_area[j]) ==  planningAreaSelected.dataset.planningArea) {
              a.style.backgroundColor = "rgb(227, 230, 228)"
            }
            a.innerHTML = Object.values(p_area[j])
            a.dataset.planningArea = Object.values(p_area[j])
            allPlanningArea.appendChild(a)
          }
        }
      }
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

function filterYearDropDown(year, selectedYear) {
  let currYear = new Date().getFullYear()
  
  for (let i = year; i <= currYear; i++) {
    let option = document.createElement("option")
    option.value = i
    option.innerHTML = i
    if (i == selectedYear) {
      option.selected = true
    }
    activityFilter.appendChild(option)
  }

  for (let i = year; i <= currYear; i++) {
    let option = document.createElement("option")
    option.value = i
    option.innerHTML = i
    if (i == selectedYear) {
      option.selected = true
    }
    fileSizeFilter.appendChild(option)
  }
}

function convertMonth(month) {
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

function getMonthArray(array1, array2) {
  let allMonth = []

  if (array1.length == 0 && array2.length == 0) {
    return allMonth
  }

  array1.forEach(e => {
    if (!allMonth.includes(e.Key)) {
      allMonth.push(e.Key)
    }
  })
  array2.forEach(e => {
    if (!allMonth.includes(e.Key)) {
      allMonth.push(e.Key)
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

function getCountArray(array1, array2) {
  let arr = []

  if (array1.length == 0 || array2.length == 0) {
    return arr
  }

  for (let i = 0; i < array1.length; i++) {
    let found = false
    for (let j = 0; j < array2.length; j++) {
      if (array1[i] == convertMonth(array2[j].Key)) {
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

function updateActivityChart(graphType) {
  uaChart.destroy()
  const uploadFetchApi = graphActivityUpload( planningAreaSelected.dataset.planningArea, activityFilter.value)
  const downloadFetchApi = graphActivityDownload( planningAreaSelected.dataset.planningArea, activityFilter.value)
  Promise.all([uploadFetchApi, downloadFetchApi])
    .then((results) => {
      generateGraphActivity(results[0].json(), results[1].json(), graphType)
    })
}

function clearYearDropDown() {
  activityFilter.innerHTML = ""
  fileSizeFilter.innerHTML = ""
}


 //Render chart --------------------------------
let generateCardActivity = (result, selectedYear) => {
  result.then(data => {
    const uploadCount = data.Item1
    const downloadCount = data.Item2
    const fileSizeAvg = data.Item3
    const year = data.Item4
    document.getElementById("upload-card-result").innerHTML = uploadCount
    document.getElementById("download-card-result").innerHTML = downloadCount
    document.getElementById("filesize-card-result").innerHTML = fileSizeAvg
    filterYearDropDown(year, selectedYear)
  })
}

let generateFileSize = (result) => {
  result.then(data => {
    let key = []
    let count = []

    data.forEach(fileSize => {
      key.push(fileSize.Key + "mb-" + (parseInt(fileSize.Key) + 1).toString() + "mb")
      count.push(fileSize.Count)
    })

    fsChart = new Chart(fsReport, {
      type: 'doughnut',
      data: {
        labels: key,
        datasets: [{
          label: 'My First Dataset',
          data: count,
          backgroundColor: [
            '#86BBD8',
            '#33658A',
            '#F6AE2D'
          ],
          hoverOffset: 4
        }]
      },
      options: {
        plugins: {
          legend: {
            display: false
          }
        }
      }
    });
  })
}

let generateGraphActivity = (result, result2, graphType) => {
  result.then(data => {
    result2.then(data2 => {
      const dataMonth = getMonthArray(data, data2)
      const dataCountUpload = getCountArray(dataMonth, data)
      const dataCountDownload = getCountArray(dataMonth, data2)
      uaChart = new Chart(uaReport, {
        type: graphType,
        data: {
          //upload
          labels: dataMonth, //Month - Key 
          datasets: [{
            label: 'Upload',
            data: dataCountUpload, //Count
            backgroundColor: [
              '#2F4858'
            ],
            borderColor: [
              '#2F4858',
            ],
            borderWidth: 1
          }, {
            //download
            label: 'Download',
            data: dataCountDownload,
            backgroundColor: [
              '#F26419'
            ],
            borderColor: [
              '#F26419'
            ],
            borderWidth: 1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
  })
}

let generateUploadComparison = (result, result2) => {
  result.then((data) => {
    result2.then((data2) => {
      const dataMonth = getMonthArray(data, data2)
      const dataCount = getCountArray(dataMonth, data)
      const data2Count = getCountArray(dataMonth, data2)

      const year = new Date().getFullYear().toString();

      upCompChart = new Chart(upCompare, {
        type: 'line',
        data: {
          labels: dataMonth,
          datasets: [{
              label: year,
              data: dataCount,
              fill: false,
              borderColor: '#2F4858',
              backgroundColor: '#2F4858',
              tension: 0.1
          },
            {
              label: year-1,
              data: data2Count,
              fill: false,
              borderColor: '#F1485B',
              backgroundColor: '#F1485B',
              tension: 0.1
            }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
  })
}

let generateDownloadComparison = (result, result2) => {
  result.then((data) => {
    result2.then((data2) => {
      const dataMonth = getMonthArray(data, data2)
      const dataCount = getCountArray(dataMonth, data)
      const data2Count = getCountArray(dataMonth, data2)

      const year = new Date().getFullYear().toString();

      downCompChart = new Chart(downCompare, {
        type: 'line',
        data: {
          labels: dataMonth,
          datasets: [{
            label: year,
            data: dataCount,
            fill: false,
            borderColor: '#F26419',
            backgroundColor: '#F26419',
            tension: 0.1
          },
          {
            label: year - 1,
            data: data2Count,
            fill: false,
            borderColor: '#F1485B',
            backgroundColor: '#F1485B',
            tension: 0.1
          }
          ]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    })
  })
}

let generateViewCount = (result) => {
  viewTop.innerHTML = ""
  result.then(data => {
    let apiFetchURL = []
    data.forEach(e => {
      apiFetchURL.push(fetch(`/api/media/${e.Key}`, {
        mode: 'same-origin',
        credentials: 'same-origin',
      }))
    })
    Promise.all(apiFetchURL)
      .then(async projectname => {
        for (let i = 0; i < apiFetchURL.length; i++) {
          await generateViewCountTable(projectname[i].json(), data[i], i+1, apiFetchURL.length)
        }
      })
  })
}

let generateViewCountTable = async (allKey, count, counter, arrSize) => {
  await allKey.then(key => {
    let p = document.createElement("p")
    let b = document.createElement("b")

    b.innerHTML = key.Project
    b.classList.add("text-overflow")
    p.appendChild(b)
    let span = document.createElement("span")
    span.innerHTML = count.Count
    span.classList.add("float-right")
    p.appendChild(span)
    viewTop.appendChild(p)
    if (counter < arrSize) {
      let hr = document.createElement("hr")
      viewTop.appendChild(hr)
    }
  })
} 


//Event Listener --------------------------------
document.getElementById("lineGraph").addEventListener('click', function () {
  updateActivityChart("line")
})

document.getElementById("barGraph").addEventListener('click', function () {
  updateActivityChart("bar")
})

$(document).on("click", '.planning-area-item', "a", function (e) {
  uaChart.destroy()
  fsChart.destroy()
  upCompChart.destroy()
  downCompChart.destroy()

  let planningAreaItem = document.getElementsByClassName('planning-area-item')
  for (let i = 0; i < planningAreaItem.length; i++) {
    planningAreaItem[i].style.backgroundColor = '#FFFFFF'
  }

  e.target.style.backgroundColor = "rgb(227, 230, 228)"

  dashboardAPICalls(e.target.dataset.planningArea, new Date().getFullYear())
})

activityFilter.addEventListener("change", function () {
  updateActivityChart("bar")
})

fileSizeFilter.addEventListener("change", function () {
  fsChart.destroy()
  const fileSizeApi = chartFileSize( planningAreaSelected.dataset.planningArea, fileSizeFilter.value)
  fileSizeApi.then(results => {
    generateFileSize(results.json())
  })
})

document.getElementById("genBtn").addEventListener('click', function () {
  const nameCreated = document.getElementById('loginUserName').innerHTML
  const baseLocation = location
  let url = new URL('/api/generatereport', baseLocation)

  const params = {
    NameCreated: nameCreated
  }

  url.search = new URLSearchParams(params)

  window.location = url
})


//function call --------------------------------

dashboardAPICalls("ALL", new Date().getFullYear())

planningAreaDropDown()








