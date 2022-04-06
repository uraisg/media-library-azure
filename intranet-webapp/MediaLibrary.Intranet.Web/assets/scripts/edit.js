import { formatDate } from './format'

function loadFileInfo() {
  const img = document.querySelector('#main-media')
  const fileInfoId = img.dataset.fileinfoid
  if (!fileInfoId) return

  fetch(`/api/media/${fileInfoId}`, {
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
      img.alt = data['Name']
      img.src = data['FileURL']
      img.parentElement.href = img.src

      renderMetadataSection(data)

      document.title = data['Name'] + ' ' + document.title
    })
    .catch((error) => {
      document.querySelector('.metadata-container').innerHTML =
        '<div class="alert alert-warning w-100">' +
        '<strong>Sorry!</strong> We have problems finding the requested media details.' +
        '</div>'
      document.title = 'Oops! ' + document.title
      console.error(error)
    })
}

async function renderMetadataSection(data) {
  const template = document.querySelector('#metadata-section')
  const clone = template.content.cloneNode(true)

  const author = clone.querySelector('.metadata-author span')
  const displayName = await getDisplayName(data['Author'])
  author.textContent = displayName

  const geo = clone.querySelector('.metadata-geo')
  if (data['Location']) {
    const toggle = geo.querySelector('.dropdown-toggle')
    const menu = geo.querySelector('.dropdown-menu')
    menu.addEventListener('click', (e) => {
      e.stopPropagation()
    })

    const img = menu.querySelector('img')
    const img2 = menu.querySelector('img:not(:first-of-type)')
    const coordinates = data['Location'].coordinates
    toggle.textContent = formatLatLng(coordinates)
    img.src = getStaticMapUrl(coordinates, 15)
    img2.src = getStaticMapUrl(coordinates, 17)
    ;['mouseenter', 'touchstart'].forEach((type) => {
      img2.addEventListener(type, (e) => {
        e.preventDefault()
        img2.classList.add('visible')
      })
    })
    ;['mouseleave', 'touchend', 'touchcancel'].forEach((type) => {
      img2.addEventListener(type, (e) => {
        e.preventDefault()

        img2.classList.remove('visible')
      })
    })
  } else {
    const span = geo.querySelector('span')
    span.textContent = 'No geotag'
  }

  const taken = clone.querySelector('.metadata-taken span')
  const uploaded = clone.querySelector('.metadata-uploaded span')
  taken.textContent += formatDate(data['DateTaken'])
  uploaded.textContent += formatDate(data['UploadDate'])

  const detailsForm = clone.querySelector('.metadata-details form')
  initFormValues(detailsForm, data)

  //populate tags in page
  const tagsContainer = clone.querySelector('.metadata-tags .tag-area')
  tagsContainer.appendChild(renderTagList(data['Tag']))
  initTagArea(tagsContainer, data['Tag'])

  //saves data on btn click
  document
    .querySelector('#saveData')
    .addEventListener('click', () => saveData(data['Id']))

  const target = document.querySelector('.metadata-container')
  const targetClone = target.cloneNode(false)
  targetClone.appendChild(clone)
  target.parentNode.replaceChild(targetClone, target)
}

function formatLatLng(coords) {
  const decimalPlaces = 5
  return (
    coords[1].toFixed(decimalPlaces) + ', ' + coords[0].toFixed(decimalPlaces)
  )
}

function getStaticMapUrl(coords, zoom) {
  const decimalPlaces = 5
  const lat = coords[1].toFixed(decimalPlaces)
  const lng = coords[0].toFixed(decimalPlaces)
  return (
    'https://developers.onemap.sg/commonapi/staticmap/getStaticImage?layerchosen=default&' +
    `lat=${lat}&lng=${lng}&zoom=${zoom}&height=256&width=256`
  )
}

function initFormValues(form, data) {
  const attribs = ['Project', 'LocationName', 'Copyright', 'Caption']
  attribs.forEach((attrib) => (form.elements[attrib].value = data[attrib]))
}

//Tags
function renderTagList(tags) {
  const fragment = new DocumentFragment()
  const template = document.querySelector('#tags-btn')

  tags.forEach(function (tag) {
    const a = template.content.firstElementChild.cloneNode(true)
    a.firstChild.data = tag
    fragment.appendChild(a)
  })
  return fragment
}

function initTagArea(tagAreaElem, initialTags) {
  //stores tag data into set for tag index identification & deletion later
  const tagSet = new Set(initialTags)

  //listens for mouse click on tag delete
  tagAreaElem.addEventListener('click', (e) => {
    //validation against user clicking wrong area
    if (!e.target.closest('.tagger-tag svg')) return
    //get closest tag to clicked target (the x button)
    const tagElem = e.target.closest('.tagger-tag')
    removeTag(tagElem)
  })

  //adds tag on btn click
  document.getElementById('addTag').addEventListener('click', (e) => {
    e.preventDefault()
    addTag()
  })

  //adds tag also allowed if enter is pressed while inside 'tag' textbox
  document.getElementById('newTagInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  })

  function removeTag(tagElem) {
      //gets text from tag element
      const targetTxt = tagElem.firstChild.data

      //removes selected tag
      tagElem.parentNode.removeChild(tagElem)

      tagSet.delete(targetTxt)
  }

  function addTag() {
    const newTagInput = document.getElementById('newTagInput')
    //gets text from field
    const newTag = newTagInput.value.trim()

    //blank validation
    if (newTag) {
      //unique text validation
      if (tagSet.has(newTag)) {
        //disallows adding
        document.querySelector('.tags-notif').innerHTML =
          '<div class="alert alert-warning w-100">' +
          '<strong>Sorry!</strong> You cannot add in duplicate tags!' +
          '</div>'
      } else {
        //removes notification banner text, if present
        document.querySelector('.tags-notif').replaceChildren()

        //clears text in 'add tag' textbox
        newTagInput.value = ''

        //creates a clone of existing tag template
        const fragment = renderTagList([newTag])

        //adds in a new tag in page, last item order
        tagAreaElem.append(fragment)
        //adds tag into set to allow for deletion later
        tagSet.add(newTag)
      }
    } else {
      //disallows adding
      document.querySelector('.tags-notif').innerHTML =
        '<div class="alert alert-warning w-100">' +
        'You cannot add a <strong>blank</strong> tag!' +
        '</div>'
    }
  }
}

function saveData(id) {
  // Do form validation
  const detailsForm = document.querySelector('.metadata-details form')
  if (!detailsForm.reportValidity()) return

  // Read new details from form
  const newValues = ['Project', 'LocationName', 'Copyright', 'Caption'].reduce((obj, attrib) => {
    return { ...obj, [attrib]: detailsForm.elements[attrib].value.trim() || null }
  }, {})

  // Read new tag list
  const tagElems = document.querySelectorAll('.metadata-container .tag-area .tagger-tag')
  const tagList = Array.prototype.map.call(tagElems, (el) => el.firstChild.data)

  // Call API with updated data
  postUpdate(id, {
    Tag: tagList,
    Caption: newValues['Caption'],
    Project: newValues['Project'],
    LocationName: newValues['LocationName'],
    Copyright: newValues['Copyright'],
  })
    .then(() => {
      window.location = `/Gallery/Item/${id}`
    })
    .catch((error) => {
      document.querySelector('.tags-notif').innerHTML =
        '<div class="alert alert-warning w-100">' +
        '<strong>Sorry!</strong> We have problems updating the media details.' +
        '</div>'
      console.error(error)
    })
}

function postUpdate(id, updatedData) {
  return fetch(`/api/media/${id}`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      RequestVerificationToken: document.getElementById(
        'RequestVerificationToken'
      ).value,
    },
    mode: 'same-origin',
    credentials: 'same-origin',
    body: JSON.stringify(updatedData),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`)
    }
  })
}

loadFileInfo()

async function getDisplayName(email) {
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

async function setLocalStorageName(email) {
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
