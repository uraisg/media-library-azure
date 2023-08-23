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
      img.onload = () => generateDownloadLinks(data['FileURL'], img.naturalWidth, img.naturalHeight)
      img.alt = data['Name']
      img.src = data['FileURL']
      document.querySelector('#media-download-original').href = data['FileURL']

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

// Populate image download links for different sizes
function generateDownloadLinks(url, imgX, imgY) {
  const createSizeText = ([x, y]) => {
    const span = document.createElement('span')
    span.innerText = `(${x}x${y})`
    return span
  }

  const downloadBtnOriginal = document.querySelector('#media-download-original')
  downloadBtnOriginal.append(' ', createSizeText([imgX, imgY]))

  const sizes = [
    [360, '#media-download-small'],
    [720, '#media-download-medium'],
    [1080, '#media-download-large'],
  ]

  for (const [size, selector] of sizes) {
    const button = document.querySelector(selector)
    const resized = resize(imgX, imgY, size)
    if (resized) {
      button.append(' ', createSizeText(resized))
      button.href = url + `/${resized[0]}-${resized[1]}`
      button.classList.remove('d-none')
    }
  }
}

// Resize height and width of an image while perserving its aspect ratio
function resize(x, y, max) {
  // Skip if image size is smaller than target maximum
  if (x < max && y < max) {
    return null
  }

  // Maximum values of height and width given, scale other dimension to preserve aspect ratio.
  if (y > x) {
    return [Math.round((max * x) / y), max]
  } else {
    return [max, Math.round((max * y) / x)]
  }
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

  const details = clone.querySelector('.metadata-details dl')
  details.appendChild(renderMediaDetails(data))

  const tags = clone.querySelector('.metadata-tags div')
  tags.appendChild(renderTagList(data['Tag']))

  const target = document.querySelector('.metadata-container')
  const targetClone = target.cloneNode(false)
  targetClone.appendChild(clone)
  target.parentNode.replaceChild(targetClone, target)

  let editAbility = $('#delAbility').data('request-url');

  if (editAbility){
    deleteListener(data['Id'], data['Name'])
  }

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

function renderMediaDetails(data) {
  const fragment = new DocumentFragment()
  const template = document.querySelector('#details-row')
  const attribs = new Map()
  attribs.set('Project', 'Name')
  attribs.set('LocationName', 'Location')
  attribs.set('Copyright', 'Copyright Owner')
  attribs.set('Caption', 'Caption')
  for (const [key, label] of attribs) {
    if (data[key]?.trim()) {
      const clone = template.content.firstElementChild.cloneNode(true)
      const dt = clone.querySelector('dt')
      const dd = clone.querySelector('dd')
      dt.textContent = label
      dd.textContent = data[key]
      fragment.append(dt, dd)
    }
  }

  // Additional Fields
  if (data['AdditionalField']) {
    const listAdditionalField = JSON.parse(data['AdditionalField']);

    listAdditionalField.forEach(json => {
      console.log(json)
      const clone = template.content.firstElementChild.cloneNode(true)
      const dt = clone.querySelector('dt')
      const dd = clone.querySelector('dd')
      dt.textContent = json["Key"]
      dd.textContent = json["Value"]
      fragment.append(dt, dd)
    })
  }

  return fragment
}

function renderTagList(tags) {
  const fragment = new DocumentFragment()
  const template = document.querySelector('#tags-btn')
  tags.forEach(function (tag) {
    const a = template.content.firstElementChild.cloneNode(true)
    a.textContent = tag
    // TODO: restore link once tag search syntax is in place
    a.href = '#'
    fragment.appendChild(a)
  })
  return fragment
}

function deleteListener(id, name) {

  var delModal = document.getElementById('actionDel');
  //handles null error if del permission not valid
  if (delModal != null) {
    //listens for mouse click on delete modal confirmation
    delModal.addEventListener('click', (e) => {
      e.preventDefault()
      postContainerDelete(id, name)

      //Modal actions
      $("#deleteModal").modal('hide')
      $("#success-alert").fadeTo(3000, 500).slideUp(500, function () {
        $("#success-alert").slideUp(500)

        //Redirect back to homepage
        var url = $('#actionDel').data('request-url');
        window.location.href = url
      });

    })
  }

}

function postContainerDelete(id, name) {
  return fetch(`/api/media/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-type': 'application/json',
      RequestVerificationToken: document.getElementById(
        'RequestVerificationToken'
      ).value,
    },
    mode: 'same-origin',
    credentials: 'same-origin',
    body: JSON.stringify(name),
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status}`)
    }
  })
}

loadFileInfo()
