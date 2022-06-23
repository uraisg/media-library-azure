export function displayPaginationByElement(totalpage, currentPage, paginationUL, paginationPrev, paginationNext, paginationPrevA, paginationNextA) {
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

export function planningAreaDropDown() {
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

export function convertActivityOption(activityOption) {
  //According to database values
  switch (activityOption) {
    case "allFilterOption":
      return 0
    case "uploadFilterOption":
      return 2
    case "downloadFilterOption":
      return 3
  }
}

export function disableActReportClick(planningAreaDD, datePeriodDD, sortingDD) {
  $(".page-number-li").remove()
  refreshTableBtn.disabled = true
  allFilterOption.style.pointerEvents = 'none'
  uploadFilterOption.style.pointerEvents = 'none'
  downloadFilterOption.style.pointerEvents = 'none'
  startDate.disabled = true
  endDate.disabled = true
  resetDateBtn.disabled = true
  planningAreaDD.disabled = true
  datePeriodDD.disabled = true
  sortingDD.disabled = true
  resetDateBtn.style.pointerEvents = 'none'
}

export function enableActReportClicks(planningAreaDD, datePeriodDD, sortingDD) {
  refreshTableBtn.disabled = false
  allFilterOption.style.pointerEvents = 'auto'
  uploadFilterOption.style.pointerEvents = 'auto'
  downloadFilterOption.style.pointerEvents = 'auto'
  startDate.disabled = false
  endDate.disabled = false
  resetDateBtn.disabled = false
  planningAreaDD.disabled = false
  datePeriodDD.disabled = false
  sortingDD.disabled = false
  resetDateBtn.style.pointerEvents = 'auto'
}

export function displaySortFilter(sortOption) {
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

export function emptyResultCheck(data, paginationErr) {
  if (data.length == 0) {
    setTimeout(() => {
      paginationErr[0].innerHTML = "No result found"
      paginationErr[1].innerHTML = "No result found"
    }, 1000)
  } else {
    paginationErr[0].innerHTML = ""
    paginationErr[1].innerHTML = ""
  }
}

export function parseAndFormatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('default', options).format(parseISO(date))
}
