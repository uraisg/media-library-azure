export const convertSort = (option) => {
  switch (option) {

    case "groupASC":
      return "Ascending by Group"
    case "groupDSC":
      return "Descending by Group"
    case "dateDSC":
      return "Newest login Date"
    case "dateASC":
      return "Oldest login Date"
    case "departmentASC":
      return "Ascending by Department "
    case "departmentDSC":
      return "Descending by Department"
    case "RoleASC":
      return " Role Ascending"
    case "RoleDSC":
      return " Role Descending"


  }
}
