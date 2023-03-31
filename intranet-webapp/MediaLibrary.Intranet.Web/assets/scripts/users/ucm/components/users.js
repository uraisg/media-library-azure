import React from "react";
import SearchUser from './@/../../../ucm/components/searchuser'
import { Button, Dropdown } from 'react-bootstrap'

const Users = [
  {
    id: 1,
    selected: false,
    name: "Leanne Graham",
    email: "userone@april.biz",
    Department: "ISGG",
    Status: "active",
    LastLoginDate: "demarco.info",
  },
  {
    id: 2,
    selected: false,
    name: "Ervin Howell",
    email: "userone1@melissa.tv",
    Department: "ISGG",
    Status: "active",
    LastLoginDate: "demarco.info",
  },
  {
    id: 3,
    selected: false,
    name: "Clementine Bauch",
    email: "Nathan@yesenia.net",
    Department: "ISGG",
    Status: "inactive",
    LastLoginDate: "demarco.info",
  },
  {
    id: 4,
    selected: true,
    name: "Patricia Lebsack",
    email: "Julianne.OConner@kory.org",
    Department: "ISGG",
    Status: "inactive",
    LastLoginDate: "demarco.info",
  },
  {
    id: 5,
    selected: false,
    name: "Chelsey Dietrich",
    email: "Lucio_Hettinger@annie.ca",
    Department: "ISGG",
    Status: "inactive",
    LastLoginDate: "demarco.info",
  },
];

class SelectTableComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      List: Users,
      MasterChecked: false,
      SelectedList: [],
    };
  }

  // Select/ UnSelect Table rows
  onMasterCheck(e) {
    let tempList = this.state.List;
    // Check/ UnCheck All Items
    tempList.map((user) => (user.selected = e.target.checked));

    //Update State
    this.setState({
      MasterChecked: e.target.checked,
      List: tempList,
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  // Update List Item's state and Master Checkbox State
  onItemCheck(e, item) {
    let tempList = this.state.List;
    tempList.map((user) => {
      if (user.id === item.id) {
        user.selected = e.target.checked;
      }
      return user;
    });

    //To Control Master Checkbox State
    const totalItems = this.state.List.length;
    const totalCheckedItems = tempList.filter((e) => e.selected).length;

    // Update State
    this.setState({
      MasterChecked: totalItems === totalCheckedItems,
      List: tempList,
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  // Event to get selected rows(Optional)
  getSelectedRows() {
    this.setState({
      SelectedList: this.state.List.filter((e) => e.selected),
    });
  }

  render() {
    return (
      <div>
        <SearchUser />
      <div
        className="shadow bg-white rounded mt-4"
      >
      
            <table className=" table table-striped table-borderless table-responsive-lg table-sm"
          width="100%">
              <thead>
                <tr>
                  <th scope="col">
                    <input
                      type="checkbox"
                      className=""
                      checked={this.state.MasterChecked}
                      id="mastercheck"
                      onChange={(e) => this.onMasterCheck(e)}
                    />
                  </th>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                <th scope="col ">Department

                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-funnel" viewBox="0 0 16 16">
                      <path d="M1.5 1.5A.5.5 0 0 1 2 1h12a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.128.334L10 8.692V13.5a.5.5 0 0 1-.342.474l-3 1A.5.5 0 0 1 6 14.5V8.692L1.628 3.834A.5.5 0 0 1 1.5 3.5v-2zm1 .5v1.308l4.372 4.858A.5.5 0 0 1 7 8.5v5.306l2-.666V8.5a.5.5 0 0 1 .128-.334L13.5 3.308V2h-11z" />
                    </svg>
                
                  
                </th>

                  <th scope="col">Status</th>
                  <th scope="col">Last Login Date</th>
                </tr>
              </thead>
              <tbody>
                {this.state.List.map((user) => (
                  <tr key={user.id} className={user.selected ? "selected" : "" }>
                    <th scope="row">
                      <input
                        type="checkbox"
                        checked={user.selected}
                        className="" 
                        id="rowcheck{user.id}"
                        onChange={(e) => this.onItemCheck(e, user)}
                      />
                    </th>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.Department}</td>
                    <td>{user.Status}</td>
                    <td>{user.LastLoginDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
         
          </div>
      </div>
      
    );
  }
}

export default SelectTableComponent;
