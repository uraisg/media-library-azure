import React from "react";
import SearchUser from './@/../../../ucm/components/searchuser'


const Users = [
  {
    id: 1,
    selected: false,
    name: "Leanne Graham",
    email: "userone@april.biz",
    Department: "ISGG",
    Status: "active",
    LastLoginDate: "03/28/2023",
  },
  {
    id: 2,
    selected: false,
    name: "Ervin Howell",
    email: "userone1@melissa.tv",
    Department: "ISGG",
    Status: "active",
    LastLoginDate: "03/28/2023",
  },
  {
    id: 3,
    selected: false,
    name: "Clementine Bauch",
    email: "Nathan@yesenia.net",
    Department: "ISGG",
    Status: "inactive",
    LastLoginDate: "03/28/2022",
  },
  {
    id: 4,
    selected: true,
    name: "Patricia Lebsack",
    email: "Julianne.OConner@kory.org",
    Department: "ISGG",
    Status: "inactive",
    LastLoginDate: "03/28/2022",
  },
  {
    id: 5,
    selected: false,
    name: "Chelsey Dietrich",
    email: "Lucio_Hettinger@annie.ca",
    Department: "ISGG",
    Status: "inactive",
    LastLoginDate: "03/28/2022",
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


  render() {
    return (
      
      <div>
        <SearchUser />
      <div
        className="shadow bg-white rounded mt-4">
      
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
                <th scope="col ">Department </th>

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
