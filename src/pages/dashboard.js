import React from "react";
import EmployeeList from "./employee/employeeList";

class Dashboard extends React.Component {
  constructor(props) {
    super(props)
  }
  edit=()=>{
    this.props.history.push('/home/updateEmployee')
   }
  render() {
    return (
  <div>
    { this.props.permission!=undefined?
    this.props.permission.empPermission.isView!==false?
    <EmployeeList permission={this.props.permission} />
      :<div>Access restriction: Need permission to view employee</div>
    :null}
  </div>
    );
  }
}
export default Dashboard;