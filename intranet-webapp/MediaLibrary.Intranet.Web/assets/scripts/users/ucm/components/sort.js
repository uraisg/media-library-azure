export const convertSort = (option) => {
  switch (option) {

    case "Statusinactive":
      return "Inactive Status"
    case "statusactive":
      return "Active Status"
    case "statussuspend":
      return "Suspend Status"
    case "dateDSC":
      return "Latest login Date"
    case "dateASC":
      return "Older login Date"
    case "departmentASC":
      return " Department Ascending "
    case "departmentDSC":
      return "Department Descending"


  }
}
