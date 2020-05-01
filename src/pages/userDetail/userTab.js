import React from "react";
import { Tabs,Icon } from "antd";
import Role from "../role/role";
import User from "../user/user";
import {withRouter} from 'react-router-dom'

const { TabPane } = Tabs;

class UserDetail  extends React.Component {
  changeTab = activeKey => {
    console.log(activeKey);}


    goback = () => {
      this.props.history.goBack();
  }
  render() {
    return (
      <div className="main-content">
        <h4>  {this.props.location.pathname!== "/home/dashboard"?   
        <Icon   type="arrow-left" onClick={this.goback}/>:null}Users</h4>
        <div className="card user-card">
        {this.props.permission.userPermission.isView==true?
              <Tabs  onTabClick={this.changeTab}
                  defaultActiveKey="role" >
                  <TabPane tab="Roles" key="role">
                  <Role permission={this.props.permission}/>
                  </TabPane>
                  <TabPane tab="Users" key="user">
                  <User permission={this.props.permission}/>
                  </TabPane>
              </Tabs>:null}
          </div>
      </div>
  );

  }
}

export default  withRouter(UserDetail);


