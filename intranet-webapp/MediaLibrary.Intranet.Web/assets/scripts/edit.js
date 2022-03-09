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
    taken2.value = data['DateTaken'].split("T")[0];
  }
  if (data['UploadDate']) {
    uploaded2.value = data['UploadDate'].split("T")[0];
  }

  //details
  var name2 = document.querySelector('#formControlInput4');
  var location2 = document.querySelector('#formControlInput5');
  var copyright2 = document.querySelector('#formControlInput6');
  var caption2 = document.querySelector('#formControlTextarea1');

  if (data['Project']) {
    name2.value = data['Project'];
  }
  if (data['LocationName']) {
    location2.value = data['LocationName'];
  }
  if (data['Copyright']) {
    copyright2.value = data['Copyright'];
  }

  if (data['Caption']) {
    caption2.value = data['Caption'];
  }

  //populate tags in page
  const template = document.querySelector('#metadata-section');
  const clone = template.content.cloneNode(true);
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

    //reads all data
    var name = document.getElementById('formControlInput4').value;
    var locationName = document.getElementById('formControlInput5').value;
    var copyright = document.getElementById('formControlInput6').value;
    var caption = document.getElementById('formControlTextarea1').value;

    //For two optional fields
    if (!copyright) {
      copyright = null;
    }
    if (!caption) {
      caption = null;
    }

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
      Caption: caption,
      Author: data['Author'],
      UploadDate: data['UploadDate'],
      FileURL: data['FileURL'],
      ThumbnailURL: data['ThumbnailURL'],
      Project: name,
      //Event: data['Event'],
      LocationName: locationName,
      Copyright: copyright,
    }
    var newJson = JSON.stringify(obj);
    console.log(newJson);

    updateFileInfo(newJson);
  }

  function updateFileInfo(newJson) {
    const img = document.querySelector('#main-media')
    const fileInfoId = img.dataset.fileinfoid

    fetch(url, {
      method: 'POST',
      headers: {
        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
      },
      credentials: 'include',
      body: 'foo=bar&lorem=ipsum'
    })
      .then(res.json())
      .then(res => {
        // Handle response 
        console.log('Response: ', res);
      })
      .catch(err => {
        // Handle error 
        console.log('Error message: ', error);
      });
  }



  function updateFileInfo(newJson) {
    const img = document.querySelector('#main-media')
    const fileInfoId = img.dataset.fileinfoid

    if (!fileInfoId) return

    fetch(`/api/media/${fileInfoId}`, {
      method: 'POST',
      headers: {
        "Content-type": "application/json; charset=utf-8"
      },
      mode: 'same-origin',
      credentials: 'same-origin',
      data: newJson,
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
