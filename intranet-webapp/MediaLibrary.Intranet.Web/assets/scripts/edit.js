import { formatDate } from './format'
import { getDisplayName } from './DisplayName'

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

  const addField = clone.querySelector('.addField')
  addField.addEventListener('click', (e) => {
    const fragment = new DocumentFragment()
    const template = document.querySelector('#additionalfields-row')

    const newid = Math.random().toString(16).slice(2)
    const clone = template.content.firstElementChild.cloneNode(true)
    const dt = clone.querySelector('dt')
    const dd = clone.querySelector('dd')
    const dx = clone.querySelector('dx')
    dt.innerHTML = '<input type="text" id="' + htmlEntities(newid) + '_Key" value="" class="form-control form-control-sm" required>'
    dd.innerHTML = '<input type="text" id="' + htmlEntities(newid) + '_Value" value="" class="form-control form-control-sm" required>'
    dx.innerHTML = '<svg id="' + htmlEntities(newid) + '" xmlns = "http://www.w3.org/2000/svg" width = "24" height = "24" viewBox = "0 0 24 24" fill = "none" stroke = "#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
    fragment.append(dt, dd, dx)

    additionalFieldEventListener(dx)

    const details = detailsForm.querySelector('.metadata-additionalfields dl')
    details.appendChild(fragment)
  })

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

  const fragment = new DocumentFragment()
  const template = document.querySelector('#additionalfields-row')

  if (data['AdditionalField']) {
    const listAdditionalField = JSON.parse(data['AdditionalField']);

    listAdditionalField.forEach(json => {
      const clone = template.content.firstElementChild.cloneNode(true)
      const dt = clone.querySelector('dt')
      const dd = clone.querySelector('dd')
      const dx = clone.querySelector('dx')
      dt.innerHTML = '<input type="text" id="' + htmlEntities(json["Id"]) + '_Key" value="' + htmlEntities(json["Key"]) + '" class="form-control form-control-sm" required>'
      dd.innerHTML = '<input type="text" id="' + htmlEntities(json["Id"]) + '_Value" value="' + htmlEntities(json["Value"]) + '" class="form-control form-control-sm" required>'
      dx.innerHTML = '<svg id="' + htmlEntities(json["Id"]) + '" xmlns = "http://www.w3.org/2000/svg" width = "24" height = "24" viewBox = "0 0 24 24" fill = "none" stroke = "#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>'
      fragment.append(dt, dd, dx)

      additionalFieldEventListener(dx)
    })
  }

  const details = form.querySelector('.metadata-additionalfields dl')
  details.appendChild(fragment)
}

// Convert characters to safe forms
function htmlEntities(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Adding event listener to remove additional fields
function additionalFieldEventListener(dx) {
  dx.addEventListener('click', (e) => {
    try {
      document.getElementById(e.target.id + "_Key").parentNode.remove()
      document.getElementById(e.target.id + "_Value").parentNode.remove()
      document.getElementById(e.target.id).parentNode.remove()
    }
    catch (e) { }

    dx.removeEventListener('click', (e))
  })
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

  // Convert additional fields in HTML to a dictionary inside a list
  const additionalFieldsList = []
  const additionalFields = detailsForm.querySelector('.metadata-additionalfields dl')
  let currentField = {}

  for (const i of additionalFields.children) {
    for (const p of i.children) {
      // Set Id as the id of the field and set the key
      if ((currentField["Id"] == null) && (p.nodeName != "svg") && (p.id.endsWith("_Key"))) {
        currentField["Id"] = p.id.slice(0, -4)
        currentField["Key"] = p.value
      }
      // Set the value
      else if ((currentField["Id"] == p.id.slice(0, -6)) && p.id.endsWith("_Value")) {
        currentField["Value"] = p.value
      }
      // If something went wrong, do a reset
      else {
        currentField = {}
      }

      // Add the dictionary into the list
      if ((currentField["Id"] != null) && (currentField["Key"] != null) && (currentField["Value"] != null)) {
        additionalFieldsList.push(currentField)
        currentField = {}
      }
    }
  }

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
    AdditionalField: JSON.stringify(additionalFieldsList)
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


