import {
  Dropzone,
  FileMosaic,
  FullScreen,
  ImagePreview,
} from "@files-ui/react";
import { useState } from "react";
import { useForm } from '@/components/AllContext'

export default function FileInput() {
  const MAX_FILES = 25
  const [imageSrc, setImageSrc] = useState(undefined);
  const formContext = useForm()

  const updateFiles = (incommingFiles) => {
    console.log("incomming files", incommingFiles);
    formContext.setFiles(incommingFiles);
  };

  const onDelete = (id) => {
    formContext.setFiles(formContext.files.filter((x) => x.id !== id));
  };

  const handleSee = (imageSource) => {
    setImageSrc(imageSource);
  }

  const ACCEPTED_FILE_TYPES = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/bmp',
    'image/heic',
  ]
  return (
    <>
      <p>
        Select up to {MAX_FILES} images to upload. Each image should be less than 40 MB. Supported
        file types: {ACCEPTED_FILE_TYPES.map((_) => _.substring(_.indexOf('/') + 1)).join(', ')}
      </p>
      <Dropzone
        onChange={updateFiles}
        minHeight="195px"
        value={formContext.files}
        accept="image/png, image/jpg,image/jpeg,image/gif,image/bmp,image/heic"
        maxFiles={MAX_FILES}
        maxFileSize={41943040}
        cleanFiles
        label="Drag'n drop files here or click to browse"
      >
        {formContext.files.map((file) => (
          <FileMosaic key={file.id} {...file} onDelete={onDelete} info
            onSee={handleSee} preview

          />

        ))}
      </Dropzone>
      <FullScreen open={imageSrc !== undefined}
        onClose={() => setImageSrc(undefined)}>
        <ImagePreview src={imageSrc}></ImagePreview>
      </FullScreen>
    </>
  );
}

