import Tab from './Tab'

const Tabs = ({ active, setActive, setAnimate }) => {
  const tabData = [
    {id: 1, value: "Public Folder"},
    {id: 2, value: "Folders"},
  ]

  return (
    <div className="tabs">
      {tabData.map(data => (
        <Tab
          key={data.id}
          data={data}
          active={active}
          setActive={setActive}
          setAnimate={setAnimate}
        />
      ))}
    </div>
  )
}

  export default Tabs
