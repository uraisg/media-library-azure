export const convertSort = (option) => {
  switch (option) {
    case "dateDSC":
      return "Newest First"
    case "dateASC":
      return "Oldest First"
  }
}
