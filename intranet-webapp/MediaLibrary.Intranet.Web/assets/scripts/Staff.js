import { setAdminNav } from './DisplayAdminNav'
import { displayPaginationByElement, displaySortFilter, emptyResultCheck } from './GenerateDashboardItem'

setAdminNav("staff")


//Variables ------------
let url;

let searchBtn = document.getElementById("searchBtn")
let tableBody = document.getElementById("staffTableBody")
let searchBar = document.getElementById("searchBar")
let refreshTableBtn = document.getElementById("refreshTableBtn")

let paginationUL = document.getElementsByClassName('paginationUL')
const paginationPrev = document.getElementsByClassName('paginationPrev')
const paginationNext = document.getElementsByClassName('paginationNext')
const paginationPrevA = document.getElementsByClassName('paginationPrevA')
const paginationNextA = document.getElementsByClassName('paginationNextA')
const paginationErr = document.getElementsByClassName('paginationErr')

let uploadDSC = document.getElementById("uploadDSC")
let uploadASC = document.getElementById("uploadASC")
let downloadDSC = document.getElementById("downloadDSC")
let downloadASC = document.getElementById("downloadASC")
let sortDetail = document.getElementById("sortDetail")


//Render data ---------------------------------------
function retrieveAPIURL(page, searchQuery, sortOption) {
  //Disallow inputs during retrieval
  disableClicks()

  //Display the proper filter options
  displaySortFilter(sortOption)

  //returns a fetch with search parameters
  const baseLocation = location
  let url = new URL('/api/staff', baseLocation)

  const params = {
    Page: page,
    SearchQuery: searchQuery,
    SortOption: sortOption
  }

  url.search = new URLSearchParams(params)

  return fetch(url, {
    mode: 'same-origin',
    credentials: 'same-origin',
  })
}


//Render table --------------------------------------
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
    .then((data) => {
      //parse json() result to display staff
      displayStaffTable(data.Item1)
      displayPagination(data.Item2, data.Item3)
    })
    .catch((error) => {
      console.log("Error: " + error);
    })
}

function displayStaffTable(data) {
  //Check if there are any data to be displayed
  emptyResultCheck(data, paginationErr)

  //Allow inputs 
  enableClicks()

  const table = document.getElementById("staffTableBody")
  data.forEach(item => {
    //store all data needed into array
    const resultItem = [
      item.StaffName,
      item.Email,
      item.Department,
      "(Group)",
      item.UploadCount,
      item.DownloadCount,
      getActivityReportURL(item.Email)
    ]

    //insert cells according to the result item array
    let row = table.insertRow(-1)
    for (let i = 0; i < 7; i++) {
      let cell = []
      cell[i] = row.insertCell(i)
      cell[i].classList.add("p-2")
      cell[i].innerHTML = resultItem[i]
    }
  })
}

function displayPagination(totalpage, currentPage) {
  //top pagination
  displayPaginationByElement(totalpage, currentPage, paginationUL[0], paginationPrev[0], paginationNext[0], paginationPrevA[0], paginationNextA[0])
  //bottom pagination
  displayPaginationByElement(totalpage, currentPage, paginationUL[1], paginationPrev[1], paginationNext[1], paginationPrevA[1], paginationNextA[1])
}


//Mini Functions -------------------
function getActivityReportURL(email) {
  const baseLocation = location
  url = new URL('/Admin/StaffActivityReport', baseLocation)

  const params = {
    Email: encodeURIComponent(email)
  }

  url.search = new URLSearchParams(params)

  return `
<div class="dropdown show">
  <a id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
      <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
    </svg>
  </a >
  <div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink">
    <a class="dropdown-item" href=${url}>Activity Report</a>
  </div>
</div>`
}

function search() {
  //Clear table body
  tableBody.innerHTML = ""

  url = retrieveAPIURL(1, searchBar.value, sortDetail.classList.value)
  callAPIURL(url)
}

function disableClicks() {
  $(".page-number-li").remove()
  searchBar.disabled = true;
  searchBtn.disabled = true;
  refreshTableBtn.style.pointerEvents = 'none'
}

function enableClicks() {
  searchBar.disabled = false;
  searchBtn.disabled = false;
  refreshTableBtn.style.pointerEvents = 'auto'
}


//Event Listener ------------------------------------
searchBtn.addEventListener('click', function () {
  search()
  
})

searchBar.addEventListener('keypress', function(e) {
  if (e.keyCode == 13 || e.key === "Enter") {
    search()
  }
})

$(document).on  ("click", '.page-link', "a", function (e) {
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

  url = retrieveAPIURL(page, searchBar.value, sortDetail.classList.value)
  callAPIURL(url)
})

refreshTableBtn.addEventListener('click', function () {
  //Clear table body
  tableBody.innerHTML = ""

  const page = document.querySelector("[data-active-page='true']").dataset.pageNum

  url = retrieveAPIURL(page, searchBar.value, sortDetail.classList.value)
  callAPIURL(url)
})

$(document).on("click", '.sortDropDown-item', "a", function (e) {
  //Clear Table Body
  tableBody.innerHTML = ""

  url = retrieveAPIURL(1, searchBar.value, e.target.id)
  callAPIURL(url)
})


//Function call -------------------------------------
url = retrieveAPIURL(1, "", "uploadDSC")
callAPIURL(url)
