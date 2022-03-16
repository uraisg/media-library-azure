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

function renderMetadataSection(data) {
  const template = document.querySelector('#metadata-section');
  const clone = template.content.cloneNode(true);

  const author = clone.querySelector('.metadata-author span')
  author.textContent = data['Author']

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
  const tags = clone.querySelector('.metadata-tags div');
  tags.appendChild(renderTagList(data['Tag']));
  const target = document.querySelector('.metadata-container');
  const targetClone = target.cloneNode(false);
  targetClone.appendChild(clone);
  target.parentNode.replaceChild(targetClone, target);

  //stores tag data into set for tag index identification & deletion later
  const tagSet = new Set(data['Tag']);
  //listens for mouse click on tag delete
  tagarea.addEventListener("click", (e) => removeTag(e, tagSet));
  //adds tag on btn click
  addTag(tagSet);
  //saves data on btn click
  saveData(data);
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

function formatDate(date) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' }
  return new Intl.DateTimeFormat('default', options).format(new Date(date))
}

function initFormValues(form, data) {
  const attribs = ['Project', 'LocationName', 'Copyright', 'Caption']
  attribs.forEach((attrib) => form.elements[attrib].value = data[attrib])
}

//Tags
function renderTagList(tags) {
  const fragment = new DocumentFragment();
  const template = document.querySelector('#tags-btn');

  tags.forEach(function (tag) {
    const a = template.content.firstElementChild.cloneNode(true);
    const b = template.content.firstElementChild.firstElementChild.cloneNode(true);
    a.textContent = tag;
    //appends delete icon (x)
    a.appendChild(b);
    fragment.appendChild(a);
  })
  return fragment;
}

loadFileInfo();

function removeTag(e,tagSet) {
  var target = e.target;
  //validation against user clicking wrong area
  if (target.toString() == "[object SVGPathElement]") {
    //[identifies as object svgpathelement - correct click]

    //gets text of clicked target (the x button)
    var targetTxt = target.parentElement.parentElement.textContent.trim();

    //checks index of item in set
    var index = Array.from(tagSet).indexOf(targetTxt);

    //gets tag's element based on index selection
    var element = document.getElementsByClassName("ml-1 bi bi-x-circle-fill text-secondary")[index];

    //removes selected tag
    element.parentNode.parentNode.removeChild(element.parentNode);

    tagSet.delete(targetTxt);
    return (tagSet);
  }
  else {
    //clicked wrong area - can be the "text" area beside the x btn (undefined) or the div area surrounding tags [object HTMLDivElement]
    //ignores click
  }

}

function addTag(tagSet) {
  document.getElementById('addTag').onclick = function () {
    //gets text from field
    var newTag = document.getElementById('newTagInput').value;

    //blank validation
    if (newTag) {
      //unique text validation
      if (tagSet.has(newTag)) {
        //disallows adding
        document.querySelector('.tags-notif').innerHTML =
          '<div class="alert alert-warning w-100" style="margin:20px">' +
          '<strong>Sorry!</strong> You cannot add in duplicate tags!' +
          '</div>'
      }
      else {
        //removes text if present
        document.querySelector('.tags-notif').innerHTML = "";

        //creates a clone of existing tag template
        const fragment = new DocumentFragment();
        var tagtemplate = document.querySelector('#tags-btn');
        var a = tagtemplate.content.firstElementChild.cloneNode(true);
        var b = tagtemplate.content.firstElementChild.firstElementChild.cloneNode(true);
        //appends new text
        a.textContent = newTag;
        a.appendChild(b);
        fragment.appendChild(a);

        var tagarea = document.getElementById('tagarea');
        //adds in a new tag in page, last item order
        tagarea.append(fragment);
        //adds tag into set to allow for deletion later
        tagSet.add(newTag);
      }
    }
    else {
      //disallows adding
      document.querySelector('.tags-notif').innerHTML =
        '<div class="alert alert-warning w-100" style="margin:20px">' +
        'You cannot add a <strong>blank</strong> tag!' +
        '</div>'
    }

  }
  return (tagSet);
}

function saveData(data) {
  document.getElementById('saveData').onclick = function () {

    var finalTagSet = new Set();

    // Read new details from form
    const detailsForm = document.querySelector('.metadata-details form')
    const newValues = ['Project', 'LocationName', 'Copyright', 'Caption'].reduce((obj, attrib) => {
      return { ...obj, [attrib]: detailsForm.elements[attrib].value.trim() || null }
    }, {})

    //gets the no. of tags
    var tagAmt = document.getElementsByClassName('btn btn-outline-secondary btn-xs mb-2 mr-2').length;

    //populates ftagset
    for (i = 0; i < tagAmt; i++) {
      finalTagSet.add(document.getElementsByClassName('btn btn-outline-secondary btn-xs mb-2 mr-2')[i].textContent.trim());
    }

    //convert to json object
    const obj = {
      Id: data['Id'],
      Name: data['Name'],
      DateTaken: data['DateTaken'],
      Location: data['Location'],
      Tag: Array.from(finalTagSet),
      Caption: newValues['Caption'],
      Author: data['Author'],
      UploadDate: data['UploadDate'],
      FileURL: data['FileURL'],
      ThumbnailURL: data['ThumbnailURL'],
      Project: newValues['Project'],
      LocationName: newValues['LocationName'],
      Copyright: newValues['Copyright'],
    }
    var newJson = JSON.stringify(obj);
    //console.log(newJson);

    updateFileInfo(newJson);
  }

  function updateFileInfo(newJson) {
    const img = document.querySelector('#main-media')
    const fileInfoId = img.dataset.fileinfoid

    if (!fileInfoId) return

    fetch(`/api/media/${fileInfoId}`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        RequestVerificationToken: document.getElementById(
          'RequestVerificationToken'
        ).value,
      },
      mode: 'same-origin',
      credentials: 'same-origin',
      body: newJson
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
        console.log('Response: ', data);
      })
      .catch((error) => {
        document.querySelector('.metadata-container').innerHTML =
          '<div class="alert alert-warning w-100">' +
          '<strong>Sorry!</strong> We have problems updating the media details.' +
          '</div>'
        document.title = 'Oops! ' + document.title
        console.error('Error message: ', error)
      })
  }

}
