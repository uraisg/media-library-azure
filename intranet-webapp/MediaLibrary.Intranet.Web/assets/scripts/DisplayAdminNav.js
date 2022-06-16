const dashboardNav = document.querySelectorAll(".adminNavDashboard")
const staffNav = document.querySelectorAll(".adminNavStaff")

export function setAdminNav(className) {
  switch (className.toLowerCase()) {

    case "dashboard":
      setClassAdminNav(dashboardNav, [staffNav])
      break

    case "staff":
      setClassAdminNav(staffNav, [dashboardNav])
      break

  }
}

function setClassAdminNav(activeClass, notActiveClass) {
  activeClass.forEach(activeDiv => {
    activeDiv.classList.add("active")
  })

  notActiveClass.forEach(notActive => {
    notActive.forEach(notActiveDiv => {
      notActiveDiv.classList.add("not-active")
    })
  })
}
