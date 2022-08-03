import styled from 'styled-components'

import ActivityChart from './@/../../../dashboard/components/ActivityChart'
import UploadComparison from './@/../../../dashboard/components/UploadComparison'
import DownloadComparison from './@/../../../dashboard/components/DownloadComparison'
import FileSize from './@/../../../dashboard/components/FileSize'
import ViewCount from './@/../../../dashboard/components/ViewCount'

const LeftDiv = styled.div`
  width: 64%;
  margin-right: 2%;

  @media only screen and (max-width: 799px) {
      width: 100%;
      margin-right: 0;
      margin-block: 1%;
  }
`

const RightDiv = styled.div`
  width: 34%;

  @media only screen and (max-width: 799px) {
      width: 100%;
  }
`

const DashboardChart = (props) => {
  return (
    <>
      <LeftDiv>
        <ActivityChart
          firstYear={props.firstYear}
          activity={props.activity}
          setActivity={props.setActivity}
          planningArea={props.planningArea}
        />

        <UploadComparison
          uploadComparison={props.uploadComparison}
        />

        <DownloadComparison
          downloadComparison={props.downloadComparison}
        />
      </LeftDiv>

      <RightDiv>
        <FileSize
          firstYear={props.firstYear}
          fileSize={props.fileSize}
          setFileSize={props.setFileSize}
          planningArea={props.planningArea}
        />

        <ViewCount
          viewStats={props.viewStats}
        />
      </RightDiv>
    </>
  )
}

export default DashboardChart
