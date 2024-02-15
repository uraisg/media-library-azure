const Tab = ({ data, active, setActive, setAnimate }) =>  {

  const changeTab = (id, animation) => {
    setActive(id)
    setAnimate(animation)
  }

  return (
    <button
      className={`tab ${active === data.id ? "active" : ""}`}
      onClick={() => changeTab(data.id, true)}    >
      {data.value}
    </button>
    )
}

export default Tab
