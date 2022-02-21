/*
$('a.edit').click(function () {
  var dad = $(this).parent().parent();
  dad.find('.displaytext').hide(); // change this
  dad.find('input[type="text"]').show().first().focus();
});

$('input[type=text]').focusout(function () {
  var dad = $(this).parent();
  $(this).hide();
  dad.find('.displaytext').show(); // and this
});*/

/*
$(function () {
  $("#editTag").click(function () { DisplayUpdateTag(); });
});

function DisplayUpdateTag() {

  var applyButton = {
    text: "OK",
    click: OKButton
  }
  var cancelButton = {
    text: "Cancel",
    click: CloseDialog
  }

  function OKButton() {
    var newTag;
    newTag = $("#UpdatedTag").val()
    $("#Tag").val(newTag)
    CloseDialog();
  }

  function CloseDialog() {
    $("#divDialog").dialog("close");
  }
}


$("#divDialog").dialog({
  buttons: [applyButton, cancelButton],
  height: 500,
  width: 500,
  modal: true,
  title: "Revise Customer Data"
});

$.get("/Home/Edit/",
  { tag: $("#CustomerId").val() },
  function (dialogHTML) {
    $("#divDialog").html(dialogHTML);
    // ... code to open the dialog 
  });
  */

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
  
  /*Set into new form fields for editing*/
  //====================================//

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

  const template = document.querySelector('#metadata-section')
  const clone = template.content.cloneNode(true)
  const tags = clone.querySelector('.metadata-tags div')
  tags.appendChild(renderTagList(data['Tag']))
  const target = document.querySelector('.metadata-container')
  const targetClone = target.cloneNode(false)
  targetClone.appendChild(clone)
  target.parentNode.replaceChild(targetClone, target)

}

//Tags
function renderTagList(tags) {
  const fragment = new DocumentFragment()
  const template = document.querySelector('#tags-btn')

  tags.forEach(function (tag) {
    const a = template.content.firstElementChild.cloneNode(true)
    const b = template.content.firstElementChild.firstElementChild.cloneNode(true)
    a.textContent = tag
    a.href = `${a.href}?TagFilter=${encodeURIComponent(tag).replace(
      /%20/g,
      '+'
    )}`
    //appends delete icon (x)
    a.appendChild(b)
    fragment.appendChild(a)
    //fragment.appendChild(b)
  })
  return fragment
}

function removeTag() {
  //document.querySelector('.ml-1 bi bi-x-circle-fill text-secondary').parentNode.removeChild('.ml-1 bi bi-x-circle-fill text-secondary');
  var element = document.getElementsByClassName("ml-1 bi bi-x-circle-fill text-secondary")[0];
  element.parentNode.removeChild(element);
}

loadFileInfo()
removeTag()

