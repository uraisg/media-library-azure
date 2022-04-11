export async function getDisplayName(email) {
  if (email == "") {
    return
  }

  let name = email;

  if (localStorage.getItem(email) == null) {
    await setLocalStorageName(email)
  }
  name = localStorage.getItem(email)

  return name
}

export async function processDisplayName(data) {
  let email = ""
  let emailCheckList = []
  for (let i = 0; i <= data.length; i++) {
    if (data[i] == null || data[i] == undefined) { continue }
    const currentDetail = data[i]["author"]
    if (currentDetail != null && currentDetail != undefined) {
      if (!emailCheckList.includes(currentDetail) && localStorage.getItem(currentDetail) == null) {
        email += currentDetail + ","
        emailCheckList.push(currentDetail)
      }
    }
  }
  await setLocalStorageName(email)
  await updateDisplayName(data)
  return data
}

async function setLocalStorageName(email) {
  if (email == "") {
    return
  }
  await fetch(`/api/account/${email}`, {
    mode: 'same-origin',
    credentials: 'same-origin',
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`)
      }
      return response.json()
    })
    .then((data) => {
      for (let i in data) {
        const mail = data[i]["Mail"]
        const displayName = data[i]["DisplayName"]
        localStorage.setItem(mail, displayName)
      }
    })
    .catch((error) => {
      console.error(error)
    })
}

function updateDisplayName(data) {
  for (let i = 0; i <= data.length; i++) {
    if (data[i] == null || data[i] == undefined) { continue }
    const currentDetail = data[i]["author"]
    if (currentDetail != null && currentDetail != undefined) {
      const displayName = localStorage.getItem(currentDetail)
      data[i]["author"] = displayName
    }
  }
  return data
}
