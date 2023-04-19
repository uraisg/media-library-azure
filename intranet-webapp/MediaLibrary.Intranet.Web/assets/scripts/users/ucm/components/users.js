import { React } from "react";
import { useState } from "react";
import { useFilter } from './@/../../../ucm/components/context'


const getColor = (user) => {
  if (user === "Active") return 'green';
  if (user === "Inactive") return 'orange';
  if (user === "Suspend") return "red";
  return '';
};


const SelectTableComponent = () => {
  const filtercontext = useFilter()

  const [isCheckAll, setIsCheckAll] = useState(false);
  const [isCheck, setIsCheck] = useState([]);


  const handleSelectAll = e => {
    setIsCheckAll(!isCheckAll);
    setIsCheck(filtercontext.result.map(li => li.id));
    if (isCheckAll) {
      setIsCheck([]);
    }
  };

  const handleClick = e => {
    const { id, checked } = e.target;
    console.log(id)
    setIsCheck([...isCheck, id]);
    if (!checked) {
      setIsCheck(isCheck.filter(item => item !== id));
    }
  };

  return (
   
    <div className="shadow bg-white rounded mt-4">

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
            <th scope="col">
              Name
            </th>
              <th scope="col">Email</th>
            <th scope="col ">Department </th>
            <th scope="col ">Group </th>
              <th scope="col">Status</th>
            <th scope="col">Last Login Date</th>
            <th scope="col">Disable Date</th>
            </tr>
          </thead>


          <tbody>

          {filtercontext.result.map((item, index) => (
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
                <td>{item.group}</td>
                <td style={{ color: getColor(item.Status) }}>{item.Status}</td>
                <td>{item.LastLoginDate}</td>
              <td>{item.DisableDate}</td>

              </tr>

            ))}
        
        </tbody>
      </table>

    </div>
   
       
   
  );

};

export default SelectTableComponent;
