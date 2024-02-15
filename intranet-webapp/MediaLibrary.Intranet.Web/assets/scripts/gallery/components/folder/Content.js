import Panel from './Panel'

const Content = ({ active, panelData, animate, setAnimate }) => {
  return (
    <div className="content">
      <div className="content-container">
        {panelData.map(data => (
          <Panel
            key={data.id}
            data={data}
            active={active}
            animate={animate}
            setAnimate={setAnimate} />
        ))}
      </div>
    </div>
    )
}

export default Content
