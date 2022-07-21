import React from 'react'

import DisplayItem from '@/components/DisplayItem'
import { useForm } from '@/components/AllContext'

const Step3 = () => {
  const fileContext = useForm()

  return (
    <React.Fragment>
      <p>Please confirm image(s) shown below for upload</p>
      <p className="text-secondary">Uploading {fileContext.retrievedFile.length} image(s)</p>
      {fileContext.retrievedFile.map((item, key) => (
        <div key={item.Id}>
          <hr />
          <DisplayItem item={item} Key={item.Id} update={false} />
        </div>

      ))}
    </React.Fragment>
  )
}

export default Step3
