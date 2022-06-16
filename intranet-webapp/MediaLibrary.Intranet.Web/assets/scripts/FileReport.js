import { setAdminNav } from './DisplayAdminNav'
import { formatDateOnly, formatTimeOnly } from './format.js'
import { processDisplayName } from './DisplayName.js'
import { parseISO } from 'date-fns'

setAdminNav("dashboard")

//Variables ------------------------------------------------
const tableBody = document.getElementById("fileTableBody")
let planningAreaSelected = document.getElementById("planningAreaSelected")

let sortDetail = document.getElementById("sortDetail")
let dateASC = document.getElementById('dateASC')
let dateDSC = document.getElementById('dateDSC')
let fileSizeASC = document.getElementById('fileSizeASC')
let fileSizeDSC = document.getElementById('fileSizeDSC')
let viewStatsASC = document.getElementById('viewStatsASC')
let viewStatsDSC = document.getElementById('viewStatsDSC')
let downloadStatsASC = document.getElementById('downloadStatsASC')
let downloadStatsDSC = document.getElementById('downloadStatsDSC')

let refreshTableBtn = document.getElementById("refreshTableBtn")

let paginationUL = document.getElementsByClassName('paginationUL')
const paginationPrev = document.getElementsByClassName('paginationPrev')
const paginationNext = document.getElementsByClassName('paginationNext')
const paginationPrevA = document.getElementsByClassName('paginationPrevA')
const paginationNextA = document.getElementsByClassName('paginationNextA')

let planningAreaDD = document.getElementById("planningAreaDropDown")
let datePeriodDD = document.getElementById("datePeriodDropDown")
let sortingDD = document.getElementById("sortingDropDown")

let url;


//Retrieve URL -------------------------------------
function retrieveAPIURL(sortOption, planningArea, startDate, endDate, page) {
  //Disallow inputs during retrieval
  disableClicks()

  //Display the proper filter options
  displaySortFilter(sortOption)
  planningAreaSelected.innerHTML = planningArea
  planningAreaSelected.dataset.planningArea = planningArea
  if (startDate != "" && endDate != "") {
    datePeriodSelected.innerHTML = `${parseAndFormatDate(startDate)} to ${parseAndFormatDate(endDate)}`
  }
  else {
    datePeriodSelected.innerHTML = "Any Time"
  }

  //returns a fetch with search parameters
  const baseLocation = location
  let url = new URL('/api/filereport', baseLocation)

  const params = {
    SortOption: sortOption,
    PlanningArea: planningArea,
    StartDate: startDate,
    EndDate: endDate,
    Page: page
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
      //parse json() result to display the file report
      displayFileReport(result.Item1, result.Item2, result.Item3)
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

function displayFileReport(data, totalPage, currPage) {
  //Check if there are any data to be displayed
  let paginationErr = document.getElementsByClassName('paginationErr')
  if (data.length == 0) {
    setTimeout(() => {
      paginationErr[0].innerHTML = "No result found"
      paginationErr[1].innerHTML = "No result found"
    }, 1000)
  } else {
    paginationErr[0].innerHTML = ""
    paginationErr[1].innerHTML = ""
  }
  displayPagination(totalPage, currPage)

  //Allow inputs 
  enableClicks()

  data.forEach(item => {
    //Display location if it is geotag
    let location = "-"
    if (item.Location.length != 0) {
      location = item.Location[0]
    }

    //Display image of item
    let a = document.createElement("a")
    a.href = '/gallery/item/' + item.FileId
    a.target = '_blank'
    let img = document.createElement("img")
    img.src = item.ThumbnailURL
    img.height = "80"
    img.width = "90"
    a.appendChild(img)

    //store all data needed into array
    let resultItem = [
      a,
      location,
      item.StaffName,
      item.Email,
      item.Department,
      "(Group)",
      `${formatDateOnly(item.UploadDateTime)} ${formatTimeOnly(item.UploadDateTime)}`,
      item.FileSize,
      item.ViewCount,
      item.DownloadCount
    ]

    //insert cells according to the result item array
    const table = document.getElementById("fileTableBody")
    let row = table.insertRow(-1)
    for (let i = 0; i < 10; i++) {
      let cell = []
      cell[i] = row.insertCell(i)
      if (i == 0) {
        cell[i].appendChild(resultItem[i])
      }
      else if (i == 6) {
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

function displayPaginationByElement(totalpage, currentPage, paginationUL, paginationPrev, paginationNext, paginationPrevA, paginationNextA) {
  let maxPageShow = 5
  let i = 1;
  let pageArr = []
  if (currentPage == 1) {
    for (i = 1; i <= maxPageShow && i <= totalpage; i++) {
      pageArr.push(i)
    }
    if (pageArr.at(-1) != totalpage) {
      pageArr.push("...")
      pageArr.push(totalpage)
    }
  }
  else if (currentPage == totalpage) {
    for (i = totalpage - maxPageShow + 1; pageArr.length < maxPageShow && i <= totalpage; i++) {
      if (i <= 0) {
        continue
      }
      pageArr.push(i)
    }

    if (pageArr.at(0) != 1) {
      if (pageArr[0] != 1) {
        pageArr.unshift(1, "...")
      }
    }
  }
  else {
    i = currentPage - 2
    for (let j = Math.floor(maxPageShow / 2); j > 0; j--) {
      if (i != 0) {
        pageArr.push(i)
      }
      i++
    }
    i = currentPage
    for (let j = Math.floor(maxPageShow / 2); j >= 0; j--) {
      pageArr.push(i)
      if (i == totalpage) {
        break
      }
      i++
    }
    if (pageArr[0] - 1 == 1) {
      pageArr.unshift(1)
    }
    else if (pageArr[0] != 1) {
      pageArr.unshift(1, "...")
    }
    if (pageArr.at(-1) + 1 == totalpage) {
      pageArr.push(totalpage)
    }
    else if (pageArr.at(-1) != totalpage) {
      pageArr.push("...")
      pageArr.push(totalpage)
    }
  }
  for (i = 0; i < pageArr.length; i++) {
    let li = document.createElement("li")
    li.classList.add("page-item")
    li.classList.add("page-number-li")
    let a = document.createElement("a")
    a.classList.add("page-link")
    a.classList.add("page-number")
    a.innerHTML = pageArr[i]
    if (pageArr[i] == "...") {
      a.style.pointerEvents = 'none'
      a.classList.add('bg-light')
      a.classList.add('text-muted')
    }
    else {
      a.dataset.pageNum = pageArr[i]
    }
    a.href = "#"
    if (pageArr[i] == currentPage) {
      li.classList.add("active")
      a.classList.add("active-page-no")
      a.style.pointerEvents = "none";
      a.dataset.activePage = true
    }
    else {
      a.dataset.activePage = false
    }
    paginationPrev.style.pointerEvents = "auto"
    paginationNext.style.pointerEvents = "auto"
    paginationPrevA.classList.remove('bg-light')
    paginationPrevA.classList.remove('text-muted')
    paginationNextA.classList.remove('bg-light')
    paginationNextA.classList.remove('text-muted')
    if (currentPage == 1) {
      paginationPrev.style.pointerEvents = "none"
      paginationPrevA.classList.add('bg-light')
      paginationPrevA.classList.add('text-muted')
    }
    if (currentPage == totalpage) {
      paginationNext.style.pointerEvents = "none"
      paginationNextA.classList.add('bg-light')
      paginationNextA.classList.add('text-muted')
    }

    li.appendChild(a)
    paginationUL.insertBefore(li, paginationNext)
  }
}


//Mini Functions -------------------------------------

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
      if (planningAreaSelected.innerHTML == "ALL") {
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
            if (Object.values(p_area[j]) == planningAreaSelected.innerHTML) {
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

function displaySortFilter(sortOption) {
  switch (sortOption) {
    case "dateASC":
      renderSortFilter(dateASC, "dateASC")
      break
    case "dateDSC":
      renderSortFilter(dateDSC, "dateDSC")
      break
    case "fileSizeASC":
      renderSortFilter(fileSizeASC, "fileSizeASC")
      break
    case "fileSizeDSC":
      renderSortFilter(fileSizeDSC, "fileSizeDSC")
      break
    case "viewStatsASC":
      renderSortFilter(viewStatsASC, "viewStatsASC")
      break
    case "viewStatsDSC":
      renderSortFilter(viewStatsDSC, "viewStatsDSC")
      break
    case "downloadStatsASC":
      renderSortFilter(downloadStatsASC, "downloadStatsASC")
      break
    case "downloadStatsDSC":
      renderSortFilter(downloadStatsDSC, "downloadStatsDSC")
      break
  }
}

function renderSortFilter(sort_detail, class_name) {
  sortDetail.removeAttribute('class')
  sortDetail.classList.add(class_name)
  sortDetail.innerHTML = sort_detail.innerHTML
  let sortDropDown = document.getElementsByClassName("sortDropDown")
  for (let i = 0; i < sortDropDown.length; i++) {
    sortDropDown[i].style.backgroundColor = "#FFFFFF"
    if (sortDropDown[i] == sort_detail) {
      sortDropDown[i].style.backgroundColor = "rgb(227, 230, 228)"
    }
  }
}

function parseAndFormatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('default', options).format(parseISO(date))
}

function filterDate() {
  //Clear table body
  tableBody.innerHTML = ""

  url = retrieveAPIURL(sortDetail.classList.value, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, 1)
  callAPIURL(url)
}

function disableClicks() {
  $(".page-number-li").remove()
  refreshTableBtn.disabled = true
  startDate.disabled = true
  endDate.disabled = true
  resetDateBtn.disabled = true
  planningAreaDD.disabled = true
  datePeriodDD.disabled = true
  sortingDD.disabled = true
  resetDateBtn.style.pointerEvents = 'none'
}

function enableClicks() {
  refreshTableBtn.disabled = false
  startDate.disabled = false
  endDate.disabled = false
  resetDateBtn.disabled = false
  planningAreaDD.disabled = false
  datePeriodDD.disabled = false
  sortingDD.disabled = false
  resetDateBtn.style.pointerEvents = 'auto'
}


//Event Listener --------------------------

$(document).on("click", '.planning-area-item', "a", function (e) {
  //Clear table body
  tableBody.innerHTML = ""

  let planningAreaItem = document.getElementsByClassName('planning-area-item')
  for (let i = 0; i < planningAreaItem.length; i++) {
    planningAreaItem[i].style.backgroundColor = '#FFFFFF'
  }

  e.target.style.backgroundColor = "rgb(227, 230, 228)"

  url = retrieveAPIURL(sortDetail.classList.value, e.target.dataset.planningArea, startDate.value, endDate.value, 1)
  callAPIURL(url)
})

refreshTableBtn.addEventListener('click', function () {
  //Clear Table Body
  tableBody.innerHTML = ""

  const page = document.querySelector("[data-active-page='true']").dataset.pageNum

  url = retrieveAPIURL(sortDetail.classList.value, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, page)
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
  tableBody.innerHTML = ""

  //Reset Date
  startDate.value = ""
  endDate.value = ""
  resetDateBtn.classList.add("d-none")

  url = retrieveAPIURL(sortDetail.classList.value, planningAreaSelected.dataset.planningArea, "", "", 1)
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

  url = retrieveAPIURL(sortDetail.classList.value, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, page)
  callAPIURL(url)
})

$(document).on("click", '.sortDropDown', "a", function (e) {
  //Clear table body
  tableBody.innerHTML = ""

  url = retrieveAPIURL(e.target.id, planningAreaSelected.dataset.planningArea, startDate.value, endDate.value, 1)
  callAPIURL(url)
})


//Function Call --------------------------
url = retrieveAPIURL("dateDSC", "ALL", "", "", 1)
callAPIURL(url)

planningAreaDropDown()

