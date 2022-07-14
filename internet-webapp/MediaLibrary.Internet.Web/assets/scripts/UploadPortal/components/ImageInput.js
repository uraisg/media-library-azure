import React from 'react'

import { useForm } from '@/components/AllContext'

// Import React FilePond
import { FilePond, registerPlugin } from 'react-filepond'

// Import FilePond styles
import 'filepond/dist/filepond.min.css'

// Import the Image EXIF Orientation and Image Preview plugins
// Note: These need to be installed separately
// `npm i filepond-plugin-image-preview filepond-plugin-image-exif-orientation --save`
import FilePondPluginImageExifOrientation from 'filepond-plugin-image-exif-orientation'
import FilePondPluginImagePreview from 'filepond-plugin-image-preview'
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

// Register the plugins
registerPlugin(FilePondPluginImageExifOrientation, FilePondPluginImagePreview, FilePondPluginFileValidateType, FilePondPluginFileValidateSize)

// Our app
export default function FileInput() {
  const formContext = useForm()

  return (
    <div className="App">
      <FilePond
        allowFileTypeValidation={true}
        acceptedFileTypes={['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp', 'image/heic']}
        files={formContext.files}
        onupdatefiles={formContext.setFiles}
        allowMultiple={true}
        name="files"
        labelIdle='Drag & Drop your files or Browse'
        allowFileSizeValidation={true}
        maxTotalFileSize='40MB'
      />
    </div>
  )
}

