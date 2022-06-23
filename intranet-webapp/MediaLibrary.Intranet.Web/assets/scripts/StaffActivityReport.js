import { setAdminNav } from './DisplayAdminNav'
import { formatDateOnly, formatTimeOnly } from './format.js'
import { parseISO } from 'date-fns'
import { displayPaginationByElement, planningAreaDropDown, convertActivityOption, disableActReportClick, enableActReportClicks, displaySortFilter, emptyResultCheck, parseAndFormatDate } from './GenerateDashboardItem'

setAdminNav("Staff")

//Variables ------------------------------------------------

let dateASC = document.getElementById("dateASC")
let dateDSC = document.getElementById("dateDSC")
let sortDetail = document.querySelector("#sortDetail")

let planningAreaDD = document.getElementById("planningAreaDropDown")
let datePeriodDD = document.getElementById("datePeriodDropDown")
let sortingDD = document.getElementById("sortingDropDown")

const allFilterOption = document.getElementById("allFilterOption")
const uploadFilterOption = document.getElementById("uploadFilterOption")
const downloadFilterOption = document.getElementById("downloadFilterOption")

const tableBody = document.getElementById("activityTableBody")
let allPlanningArea = document.getElementById("allPlanningArea")
let planningAreaSelected = document.getElementById("planningAreaSelected")
let datePeriodSelected = document.getElementById("datePeriodSelected")
const startDate = document.querySelector('#startDate')
const endDate = document.querySelector('#endDate')
const dateErrMsg = document.querySelector('#dateErrMsg')
const resetDateBtn = document.querySelector('#resetDateBtn')
let paginationUL = document.getElementsByClassName('paginationUL')
const paginationPrev = document.getElementsByClassName('paginationPrev')
const paginationNext = document.getElementsByClassName('paginationNext')
const paginationPrevA = document.getElementsByClassName('paginationPrevA')
const paginationNextA = document.getElementsByClassName('paginationNextA')
let displayName = document.getElementById("displayName")
const displayEmail = document.getElementById("displayEmail")
const displayDept = document.getElementById("displayDept")
const displayGrp = document.getElementById("displayGrp")

let url;


//Retrieve data ------------------------------------------------
function retrieveAPIURL(activityOption, sortOption, planningArea, startDate, endDate, page) {
  //Disallow inputs during retrieval
  disableActReportClick(planningAreaDD, datePeriodDD, sortingDD)

  //Display the proper filter options
  displaySortFilter(sortOption)
  planningAreaSelected.innerHTML = planningArea
  if (startDate != "" && endDate != "") {
    datePeriodSelected.innerHTML = `${parseAndFormatDate(startDate)} to ${parseAndFormatDate(endDate)}`
  }
  else {
    datePeriodSelected.innerHTML = "Any Time"
  }

  //returns a fetch with search parameters
  const baseLocation = location
  let url = new URL('/api/activityreport', baseLocation)

  const params = {
    ActivityOption: convertActivityOption(activityOption),
    SortOption: sortOption,
    PlanningArea: planningArea,
    StartDate: startDate,
    EndDate: endDate,
    Page: page,
    Email: displayEmail.innerHTML
  }

  url.search = new URLSearchParams(params)

  return fetch(url, {
    mode: 'same-origin',
    credentials: 'same-origin',
  })
}


//Render table ------------------------------------------------
function callAPIURL(data) {
  //get the result of data
  data
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
      //parse json() result to display the activity report
      displayActivityReport(result.Result, result.TotalPage, result.CurrentPage)
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

function displayActivityReport(data, totalPage, currPage) {
  //Check if there are any data to be displayed
  let paginationErr = document.getElementsByClassName('paginationErr')
  emptyResultCheck(data, paginationErr)
  displayPagination(totalPage, currPage)

  //Allow inputs 
  enableActReportClicks(planningAreaDD, datePeriodDD, sortingDD)

  data.every(item => {
    if (item.StaffName != null) {
      displayName.innerHTML = item.StaffName
    }
    if (item.Department != null) {
      displayDept.innerHTML = item.Department
      displayGrp.innerHTML = "(Group)"
    }
    return true
  })

  data.forEach(item => {
    let location = "-"
    if (item.Location.length != 0) {
      location = item.Location[0]
    }

    let a = document.createElement("a")
    a.href = '/gallery/item/' + item.FileId
    a.target = '_blank'
    let img = document.createElement("img")
    img.src = item.ThumbnailURL
    img.height = "100"
    img.width = "110"
    a.appendChild(img)

    const resultItem = [
      a,
      location,
      `${formatDateOnly(item.ActivityDateTime)} ${formatTimeOnly(item.ActivityDateTime)}`,
      item.ActivityType
    ]

    const table = document.getElementById("activityTableBody")
    let row = table.insertRow(-1)
    for (let i = 0; i < 4; i++) {
      let cell = []
      cell[i] = row.insertCell(i)
      if (i == 0) {
        cell[i].appendChild(resultItem[i])
      }
      else if (i == 2) {
        cell[i].innerHTML = resultItem[i]
        cell[i].style.whiteSpace = "nowrap"
      }
      else {
        cell[i].innerHTML = resultItem[i]
      }
    }
  })
}

function displayPagination(totalpage, currentPage) {
  //top pagination
  displayPaginationByElement(totalpage, currentPage, paginationUL[0], paginationPrev[0], paginationNext[0], paginationPrevA[0], paginationNextA[0])
  //bottom pagination
  displayPaginationByElement(totalpage, currentPage, paginationUL[1], paginationPrev[1], paginationNext[1], paginationPrevA[1], paginationNextA[1])
}


//Mini Functions --------------------------------------
function setOptionActive(filterOptionActive, filterOptions) {
  filterOptionActive.classList.add("filter-option-active")
  filterOptions.forEach(filterOption => {
    filterOption.classList.remove("filter-option-active")
  })
}

function filterDate() {
  //Clear table body
  tableBody.innerHTML = ""

  //Underline the "All" option filter
  setOptionActive(allFilterOption, [uploadFilterOption, downloadFilterOption])

  url = retrieveAPIURL("allFilterOption", sortDetail.classList.value, planningAreaSelected.innerHTML, startDate.value, endDate.value, 1)
  callAPIURL(url)
}


//Event listener -------------------------------------

//If user select All
allFilterOption.addEventListener('click', function () {
  //Clear Table Body
  tableBody.innerHTML = ""

  //Underline the "All" option filter
  setOptionActive(allFilterOption, [uploadFilterOption, downloadFilterOption])

  url = retrieveAPIURL("allFilterOption", sortDetail.classList.value, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, 1)
  callAPIURL(url)
})

//If user select Upload
uploadFilterOption.addEventListener('click', function () {
  //Clear Table Body
  tableBody.innerHTML = ""

  //Underline the "Upload" option filter 
  setOptionActive(uploadFilterOption, [allFilterOption, downloadFilterOption])

  url = retrieveAPIURL("uploadFilterOption", sortDetail.classList.value, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, 1)
  callAPIURL(url)
})

//If user select Download
downloadFilterOption.addEventListener('click', function () {
  //Clear Table Body
  tableBody.innerHTML = ""

  //Underline the "Download" option filter 
  setOptionActive(downloadFilterOption, [allFilterOption, uploadFilterOption])

  url = retrieveAPIURL("downloadFilterOption", sortDetail.classList.value, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, 1)
  callAPIURL(url)
})

$(document).on("click", '.planning-area-item', "a", function (e) {
  //Clear table body
  tableBody.innerHTML = ""

  //Underline the "All" option filter
  setOptionActive(allFilterOption, [uploadFilterOption, downloadFilterOption])

  let planningAreaItem = document.getElementsByClassName('planning-area-item')
  for (let i = 0; i < planningAreaItem.length; i++) {
    planningAreaItem[i].style.backgroundColor = '#FFFFFF'
  }

  e.target.style.backgroundColor = "rgb(227, 230, 228)"

  url = retrieveAPIURL("allFilterOption", sortDetail.classList.value, e.target.dataset.planningArea, startDate.value, endDate.value, 1)
  callAPIURL(url)
})

startDate.addEventListener('change', function () {
  resetDateBtn.classList.add("d-none")
  document.getElementById('dateDropdownDivider').classList.add('d-none')
  if (!endDate.value) {
    dateErrMsg.innerHTML = "Please select ending date"
  }
  else if (startDate.value > endDate.value) {
    dateErrMsg.innerHTML = "Please select date before ending date"
  }
  else {
    dateErrMsg.innerHTML = ""
    resetDateBtn.classList.remove("d-none")
    document.getElementById('dateDropdownDivider').classList.remove('d-none')
    filterDate()
  }
})

endDate.addEventListener('change', function () {
  resetDateBtn.classList.add("d-none")
  document.getElementById('dateDropdownDivider').classList.add('d-none')
  if (!startDate.value) {
    dateErrMsg.innerHTML = "Please select starting date"
  }
  else if (startDate.value > endDate.value) {
    dateErrMsg.innerHTML = "Please select date after starting date"
  }
  else {
    dateErrMsg.innerHTML = ""
    resetDateBtn.classList.remove("d-none")
    document.getElementById('dateDropdownDivider').classList.remove('d-none')
    filterDate()
  }
})

resetDateBtn.addEventListener('click', function () {
  //Clear Table Body
  document.getElementById("activityTableBody").innerHTML = ""

  //Underline the "All" option filter
  setOptionActive(allFilterOption, [uploadFilterOption, downloadFilterOption])

  //Reset Date
  startDate.value = ""
  endDate.value = ""
  resetDateBtn.classList.add("d-none")
  document.getElementById('dateDropdownDivider').classList.add('d-none')

  url = retrieveAPIURL("allFilterOption", sortDetail.classList.value, planningAreaSelected.dataset.planningArea, "", "", 1)
  callAPIURL(url)
})

refreshTableBtn.addEventListener('click', function () {
  //Clear Table Body
  tableBody.innerHTML = ""

  const filterOption = document.getElementsByClassName("filter-option-active")[0].id
  const page = document.querySelector("[data-active-page='true']").dataset.pageNum

  url = retrieveAPIURL(filterOption, sortDetail.classList.value, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, page)
  callAPIURL(url)
})

$(document).on("click", '.page-link', "a", function (e) {
  //Clear Table Body
  tableBody.innerHTML = ""
  let page = document.querySelector("[data-active-page='true']").dataset.pageNum
  if (isNaN(page)) {
    return
  }
  let lastPage = Array.from(document.querySelectorAll(".page-number")).pop().dataset.pageNum
  if (e.target.dataset.pageNum == "Next") {
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
          if (planningAreaSelected.dataset.planningArea == "ALL") {
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
                if (Object.values(p_area[j]) == planningAreaSelected.dataset.planningArea) {
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
    if (page < lastPage) {
      page = parseInt(page) + 1
    }
  }
  else if (e.target.dataset.pageNum == "Prev") {
    if (page > 1) {
      page = parseInt(page) - 1
    }
  }
  else {
    page = e.target.dataset.pageNum
  }

  url = retrieveAPIURL(document.getElementsByClassName("filter-option-active")[0].id, sortDetail.classList.value, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, page)
  callAPIURL(url)
})

$(document).on("click", '.sortDropDown-item', "a", function (e) {
  //Clear Table Body
  document.getElementById("activityTableBody").innerHTML = ""

  url = retrieveAPIURL(document.getElementsByClassName("filter-option-active")[0].id, e.target.id, planningAreaSelected.innerHTML, startDate.value, endDate.value, 1)
  callAPIURL(url)
})


//Function Call --------------------------
url = retrieveAPIURL(document.getElementsByClassName("filter-option-active")[0].id, "dateDSC", "ALL", "", "", 1)
callAPIURL(url)

planningAreaDropDown()
