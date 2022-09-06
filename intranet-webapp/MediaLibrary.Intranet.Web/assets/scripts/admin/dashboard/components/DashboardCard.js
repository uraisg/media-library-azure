import styled from 'styled-components'
import { Upload, Image, Download } from 'react-bootstrap-icons'
import PropTypes from 'prop-types'

const UploadCard = styled.div`
  padding: 3%;
  color: #504E9A;
  border-radius: 4px;
  display: flex;
  border-left: 3px solid #2F4858 !important;
  width: 26.5%;
  background-color: white;

  @media only screen and (max-width: 799px) {
      width: 100%;
      margin-block: 3%;
      margin-left: 0;
  }
`

const FileCard = styled.div`
  padding: 3%;
  color: #504E9A;
  border-radius: 4px;
  display: flex;
  border-left: 3px solid #FF6EC7 !important;
  margin-left: 1.5rem;
  width: 26.5%;
  background-color: white;

  @media only screen and (max-width: 799px) {
      width: 100%;
      margin-block: 3%;
      margin-left: 0;
  }
`

const DownloadCard = styled.div`
  padding: 3%;
  color: #504E9A;
  border-radius: 4px;
  display: flex;
  border-left: 3px solid #F26419 !important;
  margin-left: 1.5rem;
  width: 26.5%;
  background-color: white;

  @media only screen and (max-width: 799px) {
      width: 100%;
      margin-block: 3%;
      margin-left: 0;
  }
`

const CardText = styled.span`
  font-size: 1.4rem;
  font-weight: 600;
  color: black;
`

const IconDiv = styled.div`
  width: 50%;
  margin-top: 0.75rem;
`

const DashboardCard = (props) => {
  return (
    <>
      <UploadCard className="border shadow">
        <p className="w-50">
          Upload
          <br />
          <CardText>{props.card.Upload} images</CardText>
        </p>

        <IconDiv>
          <Upload
            size={50}
            className="reportLogo uploadLogo float-right"
          />
        </IconDiv>
      </UploadCard>

      <FileCard className="border shadow">
        <p className="w-50">
          Avg File Size
          <br />
          <CardText>{props.card.AvgFileSize}mb</CardText>
        </p>

        <IconDiv>
          <Image
            size={50}
            className="reportLogo fileLogo float-right"
          />
        </IconDiv>
      </FileCard>

      <DownloadCard className="border shadow">
        <p className="w-50">
          Download
          <br />
          <CardText>{props.card.Download} Images</CardText>
        </p>
        <IconDiv>
          <Download
            size={50}
            className="reportLogo downloadLogo float-right"
          />
        </IconDiv>
      </DownloadCard>
    </>
  )
}

DashboardCard.propTypes = {
  card: PropTypes.object
}

export default DashboardCard
