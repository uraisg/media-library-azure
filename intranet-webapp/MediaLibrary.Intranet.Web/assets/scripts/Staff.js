import { setAdminNav } from './DisplayAdminNav'
import { processDisplayName } from './DisplayName.js'

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
  if (data.length == 0) {
    setTimeout(() => {
      paginationErr[0].innerHTML = "No result found"
      paginationErr[1].innerHTML = "No result found"
    }, 2000)
  } else {
    paginationErr[0].innerHTML = ""
    paginationErr[1].innerHTML = ""
  }

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


//Mini Functions -------------------
function getActivityReportURL(email) {
  const baseLocation = location
  url = new URL('/Admin/StaffActivityReport', baseLocation)

  const params = {
    Email: encodeURIComponent(email)
  }

  url.search = new URLSearchParams(params)

  return `<div class="dropdown show"><a id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16"><path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /></svg></a ><div class="dropdown-menu dropdown-menu-right" aria-labelledby="dropdownMenuLink"><a class="dropdown-item" href=${url}>Activity Report</a></div></div>`
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

function displaySortFilter(sortOption) {
  switch (sortOption) {
    case "uploadDSC":
      renderSortFilter(uploadDSC, "uploadDSC")
      break
    case "uploadASC":
      renderSortFilter(uploadASC, "uploadASC")
      break
    case "downloadASC":
      renderSortFilter(downloadASC, "downloadASC")
      break
    case "downloadDSC":
      renderSortFilter(downloadDSC, "downloadDSC")
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
