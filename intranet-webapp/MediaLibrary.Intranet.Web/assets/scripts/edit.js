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

  //location
  var geo1 = document.querySelector('#formControlInput1')
  if (data['Location']) {
    var coordinates2 = data['Location'].coordinates
    console.log(coordinates2)
    geo1.value = formatLatLng(coordinates2)
  }

  //taken & uploaded date
  var taken2 = document.querySelector('#formControlInput2')
  var uploaded2 = document.querySelector('#formControlInput3')
  //splits and takes only YYYY-MM-DD, ignores the T values behind
  if (data['DateTaken']) {
    taken2.value = data['DateTaken'].split("T")[0]
  }
  if (data['UploadDate']) {
    uploaded2.value = data['UploadDate'].split("T")[0]
  }

  //details
  var name2 = document.querySelector('#formControlInput4')
  var location2 = document.querySelector('#formControlInput5')
  var copyright2 = document.querySelector('#formControlInput6')
  var caption2 = document.querySelector('#formControlTextarea1')

  if (data['Project']) {
    name2.value = data['Project']
  }
  if (data['LocationName']) {
    location2.value = data['LocationName']
  }
  if (data['Copyright']) {
    copyright2.value = data['Copyright']
  }

  if (data['Caption']) {
    caption2.value = data['Caption']
  }

  //populate tags in page
  const template = document.querySelector('#metadata-section')
  const clone = template.content.cloneNode(true)
  const tags = clone.querySelector('.metadata-tags div')
  tags.appendChild(renderTagList(data['Tag']))
  const target = document.querySelector('.metadata-container')
  const targetClone = target.cloneNode(false)
  targetClone.appendChild(clone)
  target.parentNode.replaceChild(targetClone, target)

  //stores tag data into set for tag index identification & deletion later
  const tagSet = new Set(data['Tag']);
  //listens for mouse click on tag delete
  tagarea.addEventListener("click", (e) => removeTag(e, tagSet));
  //adds tag on btn click
  addTag(tagSet);
}

//Tags
function renderTagList(tags) {
  const fragment = new DocumentFragment()
  const template = document.querySelector('#tags-btn')

  tags.forEach(function (tag) {
    const a = template.content.firstElementChild.cloneNode(true)
    const b = template.content.firstElementChild.firstElementChild.cloneNode(true)
    a.textContent = tag
    //appends delete icon (x)
    a.appendChild(b)
    fragment.appendChild(a)
  })
  return fragment
}

loadFileInfo();

function removeTag(e,tagSet) {
  var target = e.target;
  //gets text of clicked target
  var targetTxt = target.textContent.trim();

  //checks index of item in set
  var index = Array.from(tagSet).indexOf(targetTxt);

  //gets tag's element based on index selection
  var element = document.getElementsByClassName("ml-1 bi bi-x-circle-fill text-secondary")[index];

  //removes selected tag
  element.parentNode.parentNode.removeChild(element.parentNode);

  tagSet.delete(targetTxt);
  return (tagSet);
}

function addTag(tagSet) {
  document.getElementById('addTag').onclick = function () {
    //gets text from field
    var newTag = document.getElementById('newTagInput').value;

    //checks for unique values in set, before allowing adding
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
  return (tagSet);
}

