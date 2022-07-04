import styled from 'styled-components'
import { X, Plus } from 'react-bootstrap-icons'
import { Button } from 'react-bootstrap'

const Sidebar = styled.div`
  z-index: 1022;
  width: 450px;
  height: 100%;
  top: 0;
  right:0;
  position: fixed;
  background-color: white;
  transition: width 2s;
`

const Title = styled.span`
  font-weight: bold;
  font-size: 1.2em;
`

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
  cursor: pointer;
`

const ButtonArea = styled.div`
  bottom: 1em;
  width: 92%;
  position: absolute;
`

export default function BatchEdit(props) {
  return (
    <Background>
      <Sidebar className="shadow">
        <div className="mt-4 ml-3 mr-2">
          <Title>Edit Details</Title>
          <X size={35} className="float-right" onClick={() => props.setBatchEdit(false)} />
        </div>
        <div className="mt-5 container">
          <div className="row">
            <div className="mt-1 col-3"><strong>Name:<span style={{ color: 'red' }}>*</span></strong></div>
            <div className="col-9"><input type="text" className="form-control" /></div>
          </div>
          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Location:<span style={{ color: 'red' }}>*</span></strong></div>
            <div className="col-9"><input type="text" className="form-control" /></div>
          </div>
          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Copyright:</strong></div>
            <div className="col-9"><input type="text" className="form-control" /></div>
          </div>
          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Caption:</strong></div>
            <div className="col-9"><input type="text" className="form-control" /></div>
          </div>
          <div className="mt-2 row">
            <div className="mt-1 col-3"><strong>Tags:</strong></div>
            <div className="col-9"><input type="text" className="form-control" /></div>
          </div>
          <ButtonArea>
            <span className="text-danger"><Plus size={30} color={'red'} /> Add new Field</span>
            <div className="float-right">
              <Button variant="secondary">Reset</Button>{' '}
              <Button variant="primary">Save</Button>{' '}
            </div>
          </ButtonArea>
        </div>
      </Sidebar>
    </Background>
  )
}
