import React, { useState } from 'react'

import DisplayItem from '@/components/DisplayItem'
import { useFile } from '@/components/AllContext'

export default function Step3() {
  const fileContext = useFile()

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
