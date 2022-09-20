import React from 'react'
import { ChevronRight } from 'react-bootstrap-icons'
import PropTypes from 'prop-types'

const ViewCount = (props) => {
  return (
    <div className="shadowHover shadow pb-4 p-1-responsive bg-white rounded mt-3">
      <p className="text-primary">View Statistics</p>

      <hr />

      <div className="view-stat" id="viewTop">
        {props.viewStats.map((item, key) => (
          <React.Fragment key={key}>
            <p>
              <b className="text-overflow">{item.Name}</b>
              <span className="float-right">{item.View}</span>
            </p>
            {props.viewStats.length != key+1 &&
            <hr />
            }
          </React.Fragment>
        ))}
      </div>

      <hr className="mt-3" />

      <p className="float-right text-primary">
        <a
          href="/Admin/FileReport"
        >
          Open File Report
          <ChevronRight
            size={16}
            className="ml-2"
          />
        </a>
      </p>
    </div>
  )
}

ViewCount.propTypes = {
  viewStats: PropTypes.arrayOf(PropTypes.object)
}

export default ViewCount
