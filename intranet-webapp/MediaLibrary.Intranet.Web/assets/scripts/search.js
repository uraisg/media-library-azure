function initFilters() {
  const filterInputs = document.querySelectorAll(
    '.filter-sidebar input, .filter-sidebar select'
  )
  const applyButton = document.querySelector('.filter-sidebar button')
  if (!filterInputs.length || !applyButton) return

  setInitialDate('#filter-date-from', '#MinDateTaken')
  setInitialDate('#filter-date-to', '#MaxDateTaken')

  // Enable apply button only when selected filters have changed
  applyButton.classList.add('disabled')
  Array.prototype.forEach.call(filterInputs, (element) => {
    element.addEventListener('change', () => {
      applyButton.classList.remove('disabled')
    })
  })
}

function setInitialDate(controlSelector, formInputSelector) {
  const formInput = document.querySelector(formInputSelector)
  const control = document.querySelector(controlSelector)
  const initialValue = parseInt(formInput.value, 10) * 1000
  if (!Number.isNaN(initialValue)) control.valueAsNumber = initialValue
  control.addEventListener('change', () => {
    formInput.value = control.valueAsNumber / 1000
  })
}

initFilters()
$('[data-toggle="tooltip"]').tooltip()
$('#gallery').justifiedGallery({
  lastRow: 'nojustify',
  margins: 5,
})
