export const convertSort = (option) => {
  switch (option) {

    case "GroupASC":
      return " Group Ascending"
    case "GroupDSC":
      return " Group Descending"
   
    case "dateDSC":
      return "Latest login Date"
    case "dateASC":
      return "Older login Date"
    case "departmentASC":
      return " Department Ascending "
    case "departmentDSC":
      return "Department Descending"
    case "RoleASC":
      return " Role Ascending"
    case "RoleDSC":
      return " Role Descending"


  }
}
