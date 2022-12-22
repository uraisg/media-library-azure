import React from 'react'
import { FilePond, registerPlugin } from 'react-filepond'
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type'
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'
import 'filepond/dist/filepond.min.css'

import { useForm } from '@/components/AllContext'

// Register the FilePond plugins
registerPlugin(
  FilePondPluginFileValidateSize,
  FilePondPluginFileValidateType,
  FilePondPluginImageExifOrientation,
  FilePondPluginImagePreview
)

const MAX_FILES = 25
const MAX_FILE_SIZE = '40MB'
const ACCEPTED_FILE_TYPES = [
  'image/png',
  'image/jpg',
  'image/jpeg',
  'image/gif',
  'image/bmp',
  'image/heic',
]

const FileInput = () => {
  const formContext = useForm()

  return (
    <div className="mb-3">
      <p>Select up to {MAX_FILES} images to upload</p>
      <FilePond
        name="files"
        files={formContext.files}
        onupdatefiles={formContext.setFiles}
        allowMultiple={true}
        maxFiles={MAX_FILES}
        allowFileTypeValidation={true}
        acceptedFileTypes={ACCEPTED_FILE_TYPES}
        allowFileSizeValidation={true}
        maxFileSize={MAX_FILE_SIZE}
        labelIdle='Drag images here or <span class="filepond--label-action">browse</span>'
      />
      <small className="form-text text-secondary">
        Each image should be less than 40 MB. Supported file types:{' '}
        {ACCEPTED_FILE_TYPES.map((_) => _.substring(_.indexOf('/') + 1)).join(', ')}
      </small>
    </div>
  )
}

export default FileInput
