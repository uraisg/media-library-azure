import { React } from "react";
import { useState, useEffect } from "react";

const getColor = (user) => {
  if (user === "Active") return 'green';
  if (user === "Inactive") return 'red';
  return '';
};

const Users = [
  {
    id:"1",
    name: "User1",
   email: "userone@april.biz",
   Department: "ISGG",
   Status: "Active",
    LastLoginDate: "03/28/2023",
  },
  {
    id: "2",
    name: "usertwo ",
   email: "userone@april.biz",
   Department: "ISGG",
   Status: "Active",
    LastLoginDate: "03/28/2023",
  },
  {
    id: "3",
    name: "Clementine ",
    email: "Clementine@april.biz",
    Department: "ISGG",
    Status: "Inactive",
    LastLoginDate: "03/28/2022",
  },
  {
    id: "4",
    name: "Patricia ",
    email: "Patricia@april.biz",
  Department: "ISGG",
    Status: "Inactive",
    LastLoginDate: "03/28/2022",
  },
  {
    id: "5",
    name: "Chelsey ",
    email: "Chelsey@april.biz",
    Department: "ISGG",
    Status: "Inactive",
    LastLoginDate: "03/28/2022",
  },
];


const SelectTableComponent = () => {
  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(Users);
  }, [list]);

  const handleSelectAll = e => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(list.map(li => li.id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const handleClick = e => {
    const { id, checked } = e.target;
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter(item => item !== id));
    }
  };



  console.log(isCheck);

  return (
   
      <div
        className="shadow bg-white rounded mt-4">

      <table className=" table table-striped table-borderless table-responsive-lg table-lg"
        width="100%" >
          <thead>
            <tr>
              <th scope="col">
                <input
                  type="checkbox"
                  onChange={handleSelectAll}
                  checked={isCheckAll}
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

            {list.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="checkbox"
                    id={item.id}
                    onChange={handleClick}
                    checked={isCheck.includes(item.id)}
                  />
                </td>
                  <td>{item.name}</td>
                <td>{item.email}</td>
                <td>{item.Department}</td>
                <td style={{ color: getColor(item.Status) }}>{item.Status}</td>
                <td>{item.LastLoginDate}</td>
          
              </tr>

            ))}
        
          </tbody>
      </table>

      </div>
   
  );

};

export default SelectTableComponent;
