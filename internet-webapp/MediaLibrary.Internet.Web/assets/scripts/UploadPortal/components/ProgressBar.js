import { useEffect } from 'react'
import { ProgressBar } from 'react-bootstrap'
import styled from 'styled-components'

const Background = styled.div`
  position: fixed;
  display: block;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
  z-index: 1021;
`

const Bar = styled.div`
  width: 80%;
  margin: 0 10%;
  bottom: 15px;
  position: absolute;
`

export default function Progressbar(props) {
  let interval;
  useEffect(() => {
      interval = setInterval(() => {
        props.setCompletePercentage(completed => completed + 10)
      }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <Background>
      <Bar>
        <div className="pl-5 p-3 rounded text-white bg-dark">
          {props.activeStep === 0 ? 'Generating image details...' : 'Uploading to intranet...'}
        </div>
        <ProgressBar animated now={props.completed} className="border" />
      </Bar>
    </Background>
  )
}
