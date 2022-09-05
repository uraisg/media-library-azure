export const convertSort = (option) => {
  switch (option) {
    case "dateDSC":
      return "Newest First"
    case "dateASC":
      return "Oldest First"
    case "fileSizeASC":
      return "Smallest File First"
    case "fileSizeDSC":
      return "Largest File First"
    case "viewStatsASC":
      return "Least Viewed First"
    case "viewStatsDSC":
      return "Most Viewed First"
    case "downloadStatsASC":
      return "Least Download First"
    case "downloadStatsDSC":
      return "Most Download First"
    case "uploadASC":
      return "Least Upload First"
    case "uploadDSC":
      return "Most Upload First"
    case "downloadASC":
      return "Least Download First"
    case "downloadDSC":
      return "Most DownloadFirst"
  }
}