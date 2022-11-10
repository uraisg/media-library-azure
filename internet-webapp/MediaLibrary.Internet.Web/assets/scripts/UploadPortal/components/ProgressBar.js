import { useEffect } from 'react'
import { ProgressBar } from 'react-bootstrap'
import { styled } from '@linaria/react'

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
  width: 50%;
  margin: 0 25%;
  bottom: 15px;
  position: absolute;
`

const Progressbar = (props) => {
  let interval;

  useEffect(() => {
    if (props.completed < 90) {
      interval = setInterval(() => {
        props.setCompletePercentage((completed) => {
          if (completed < 90) {
            completed = completed + 10
          }

          return completed
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [])

  return (
    <Background>
      <Bar>
        <div className="pl-5 p-3 text-white bg-dark">
          {props.activeStep === 0 ? 'Generating image details...' : 'Uploading to intranet...'}
        </div>
        <ProgressBar animated now={props.completed} className="border rounded-0" />
      </Bar>
    </Background>
  )
}

export default Progressbar
