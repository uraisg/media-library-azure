const omBaseUrl = 'https://developers.onemap.sg'

export const queryPostalCode = async (postalCode) => {
  postalCode = postalCode.trim()

  if (!postalCode) {
    return null
  }

  // Construct search query url
  const url = new URL('commonapi/search', omBaseUrl)
  url.search = new URLSearchParams({
    searchVal: postalCode,
    returnGeom: 'Y',
    getAddrDetails: 'N',
  })

  const response = await fetch(url, {
    mode: 'cors',
    credentials: 'omit',
  })
  if (!response.ok) {
    throw new Error(`Network response was not ok: ${response.status}`)
  }
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    throw new TypeError("Oops, we haven't got JSON!")
  }

  const data = await response.json()
  const searchResults = data.results

  if (!searchResults.length) {
    return null
  }

  // Extract coordinates from first result
  const obj = searchResults[0]
  const coords = [parseFloat(obj.LONGITUDE), parseFloat(obj.LATITUDE)]

  return coords
}
