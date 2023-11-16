export const convertSort = (option) => {
  switch (option) {

    case "groupASC":
      return "Ascending by Group"
    case "groupDSC":
      return "Descending by Group "
    case "dateDSC":
      return "Newest login Date"
    case "dateASC":
      return "Oldest login Date"
    case "SuspendedDateDSC":
      return "Newest Suspended Date"
    case "SuspendedDateASC":
      return "Oldest Suspended Date"
    case "departmentASC":
      return " Ascending by Department "
    case "departmentDSC":
      return " Descending by Department "




  }
}
