import React from "react";
import { Switch, Route ,Redirect} from "react-router-dom";
import UpdateEmployee from "../updateEmployee/updateEmployeeTabs";
import Dashboard from "../dashboard";
import EmployeeDetail from "../employee/employeeDetail";
import UserDetail from "../userDetail/userTab";
import OrganisationDetail from "../organisationDetail/organisationTab";
import EditOrganisation from "../organisationDetail/editOrganisation";
import DeprovisionAssets from "../updateEmployee/deprovision/deprovisionAsstes";
class HomeRouting extends React.Component {
  componentDidUpdate(){
     if (window.location.hash === '#/home/dashboard') {
      window.history.pushState(null, null, window.location.href);
      window.onpopstate = function () {
        window.history.go(0);
      };
    }
  }
render() {
    return (
      <Switch>
         <Route path={`/home/updateEmployee`} component={UpdateEmployee}  />
        <Route path={`/home/employeeDetail`}  render={() => (<EmployeeDetail permission={this.props.role}/>)} />
        <Route path={`/home/user`}   render={() => (<UserDetail permission={this.props.role}/>)} />
        <Route path={`/home/organisation`} render={() => (<OrganisationDetail permission={this.props.role}/>)}/>
       <Route path={`/home/edit/organisation`}component={EditOrganisation} />
        <Route path={`/home/dashboard`} render={() => (<Dashboard permission={this.props.role}/>)}  />
        <Redirect from="/home" to="/home/Dashboard" />
      </Switch>
    );
  }
}
export default HomeRouting;