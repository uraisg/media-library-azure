import $ from 'jquery'

function setValidationValues(options, ruleName, value) {
  options.rules[ruleName] = value
  if (options.message) {
    options.messages[ruleName] = options.message
  }
}

$.validator.addMethod(
  'filesize',
  function (value, element, param) {
    if (this.optional(element)) {
      return true
    }

    const totalFileSize = Array.from(element.files)
      .map(({ size }) => size)
      .reduce((a, b) => a + b, 0)

    return totalFileSize <= param * 1024 * 1024
  },
  'The total file size must not exceed {0} MB.'
)

$.validator.unobtrusive.adapters.addSingleVal('filesize', 'maxsize')
