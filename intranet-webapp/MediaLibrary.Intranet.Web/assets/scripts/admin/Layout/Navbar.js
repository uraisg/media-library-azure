import { Globe2, People } from 'react-bootstrap-icons'

const Navbar = (props) => {
  return (
    <div className="shadow admin-nav">
      <a href="/Admin" className="text-decoration-none text-dark">
        <div className={(props.active == "Dashboard" ? "active " : "not-active ") + "admin-nav-items adminNavDashboard"}>
          <Globe2
            className="admin-nav-icon"
          />
          <span className="ml-2">Dashboard</span>
        </div>
      </a>
      <a href="/Admin/Staff" className="text-decoration-none text-dark">
        <div className={(props.active == "Staff" ? "active " : "not-active ") + "admin-nav-items adminNavDashboard"}>
          <People
            className="admin-nav-icon"
          />
        <span className="ml-2">Staff</span>
      </div>
      </a >
  </div>
  )
}

export default Navbar
