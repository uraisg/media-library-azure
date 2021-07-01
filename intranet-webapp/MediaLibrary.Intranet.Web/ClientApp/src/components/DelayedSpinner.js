import React, { useEffect, useState } from 'react'
import Spinner from 'react-bootstrap/Spinner'

const DelayedSpinner = ({ size }) => {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), 750)

    return () => clearTimeout(timer)
  })

  return (
    showSpinner && <Spinner size={size} animation="border" variant="primary" />
  )
}

export default DelayedSpinner
