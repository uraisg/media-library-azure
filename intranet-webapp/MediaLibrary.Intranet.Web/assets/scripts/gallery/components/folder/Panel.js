import React, { useRef } from 'react'
import { CSSTransition } from 'react-transition-group'

const Panel = ({ data, active, animate, setAnimate }) => {

  const nodeRef = useRef(null);

  return (
    <CSSTransition
      in={animate}
      timeout={100}
      nodeRef={nodeRef}
      classNames="panel-fade"
      onEntered={() => setAnimate(false)}
    >
      <div>
      {active === data.id &&
        <div className="panel">
          {data.content}
        </div>
      }
    </div>
    </CSSTransition >
    )
}
 export default Panel
