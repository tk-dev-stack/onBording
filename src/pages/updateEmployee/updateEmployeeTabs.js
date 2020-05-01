import React from "react";
import queryString from "query-string";
import { GenericApiService } from "../../Utils/GenericService";
import UrlConstant from "../../Utils/UrlConstant";
import { Tabs, Button, Icon } from "antd";
import Deprovision from "./deprovision/deprovision";
import EmployeeEngagement from "./employeeEngagement/employeeEngagement";
import Document from "./document/document";
import PersonalDetail from "./personalDetail/personalDetail";
import AddPersonalDetail from "./personalDetail/addPersonalDetail";
import { connect } from "react-redux";
import { array } from "prop-types";
import Provision from "./provision/provision";
import AddSalaryBreakUp from "./employeeSalaryBreakUp/addSalaryBreakUp";
const { TabPane } = Tabs;

class UpdateEmployee extends React.Component {
  componentWillMount() {
    const value = new queryString.parse(this.props.location.search);
    value.employee !== "new"
      ? this.setState({
          queryDetail: { eid: value.employee, isupdate: true },
          employeeId: value.employee
        })
      : this.setState({
          queryDetail: { eid: value.employee, isupdate: false },
          employeeId: ""
        });
    value.ot !== undefined
      ? this.setState({ openTab: value.ot })
      : this.setState({ openTab: "personalDetail" });
  }
  componentWillUnmount() {
    this.setState({ queryDetail: {}, employeeId: "", openTab: "" });
  }

  constructor(props) {
    super(props);
    this.state = {
      openTab: "personalDetail",
      employeeId: ""
    };
    this.refreshDeprovision = React.createRef();
  }

  changeTab = activeKey => {
    this.setState({ openTab: activeKey });
    if (activeKey === "deprovision") {
      this.handleRefresh();
    }
  };
  handleRefresh = () => {
    // Click on the checkbox
    if (this.refreshDeprovision.current !== null) {
      this.refreshDeprovision.current.refresh();
    }
  };
  updatedEmployeeName(obj) {
    this.setState({ empName: obj });
  }
  changeNextTab(obj) {
    this.setState({ openTab: obj });
  }
  updateNewEmployee(obj) {
    this.setState(
      {
        queryDetail: { eid: obj.employeeId, isupdate: true },
        employeeId: obj.employeeId,
        empName: obj.firstName + "" + obj.lastNamez,
        // openTab: "document"
      },
      () => console.log(this.state)
    );
  }
  nextTab = () => {
    if (this.state.openTab == "deprovision" && this.state.employeeId !== " ") {
    }
    switch (this.state.openTab) {
      case "personalDetail":
        this.setState({ openTab: "salary" });

        break;
      case "salary":
        this.setState({ openTab: "document" });

        break;
      case "document":
        this.setState({ openTab: "provision" });

        break;
      case "provision":
        this.setState({ openTab: "training" });

        break;
      case "training":
        this.setState({ openTab: "deprovision" });

        break;
    }
  };
  prevTab = () => {
    switch (this.state.openTab) {
      case "salary":
        this.setState({ openTab: "personalDetail" });

        break;
      case "document":
        this.setState({ openTab: "salary" });

        break;
      case "provision":
        this.setState({ openTab: "document" });

        break;
      case "training":
        this.setState({ openTab: "provision" });

        break;
      case "deprovision":
        this.setState({ openTab: "training" });

        break;
    }
  };
  goback = () => {
    this.props.history.goBack();
  };
  render() {
    return (
      <div className="main-content">
        <h4>
          {" "}
          {this.props.location.pathname !== "/home/dashboard" ? (
            <Icon type="arrow-left" onClick={this.goback} />
          ) : null}
          {this.state.empName == undefined ? "Employee" : ""}{" "}
          {this.state.empName !== undefined &&
          this.state.empName !== "null null" ? (
            <span className="light-f">
              {" "}
              {this.state.empName.charAt(0).toUpperCase() +
                this.state.empName.slice(1)}{" "}
            </span>
          ) : (
            ""
          )}
        </h4>
        {this.state.queryDetail != undefined ? (
          <div className="card user-card emp-card">
            {this.props.role.empPermission.isView === true ? (
              <Tabs onTabClick={this.changeTab} activeKey={this.state.openTab}>
                <TabPane
                  className="personal-details"
                  tab={
                    <div>
                      <span className="tab-num">1</span>Personal Details
                    </div>
                  }
                  key="personalDetail"
                >
                  {this.state.queryDetail.isupdate == true ? (
                    this.props.role.empPermission.isEdit == true ? (
                      <PersonalDetail
                        permission={this.props.role}
                        tabObj={this.state}
                        updatedName={this.updatedEmployeeName.bind(this)}
                        changeNextTab={this.changeNextTab.bind(this)}
                      />
                    ) : null
                  ) : this.props.role.empPermission.isCreate == true ? (
                    <AddPersonalDetail
                      changeNextTab={this.changeNextTab.bind(this)}
                      permission={this.props.role}
                      update={this.updateNewEmployee.bind(this)}
                    />
                  ) : null}
                </TabPane>
                <TabPane
                  className="salarybreakup"
                  disabled={this.state.employeeId !== "" ? false : true}
                  tab={
                    <div>
                      <span className="tab-num">2</span>Salary Particulars
                    </div>
                  }
                  key="salary"
                >
                  <AddSalaryBreakUp
                    tabObj={this.state}
                    permission={this.props.role}
                    changeNextTab={this.changeNextTab.bind(this)}
                  />
                </TabPane>

                <TabPane
                  className="document"
                  disabled={this.state.employeeId !== "" ? false : true}
                  tab={
                    <div>
                      <span className="tab-num">3</span>Documents
                    </div>
                  }
                  key="document"
                >
                  <Document
                    tabObj={this.state}
                    permission={this.props.role}
                    docUpload={Math.random()}
                    changeNextTab={this.changeNextTab.bind(this)}
                  />
                </TabPane>

                <TabPane
                  className="provisioning"
                  disabled={this.state.employeeId !== "" ? false : true}
                  tab={
                    <div>
                      <span className="tab-num">4</span>Provisioning
                    </div>
                  }
                  key="provision"
                >
                  <Provision
                    tabObj={this.state}
                    permission={this.props.role}
                    changeNextTab={this.changeNextTab.bind(this)}
                  />
                </TabPane>
                <TabPane
                  className="training"
                  disabled={this.state.employeeId !== "" ? false : true}
                  tab={
                    <div>
                      <span className="tab-num">5</span>Training
                    </div>
                  }
                  key="training">
                  <EmployeeEngagement
                    permission={this.props.role}
                    tabObj={this.state}
                    changeNextTab={this.changeNextTab.bind(this)}
                  />
                </TabPane>

                <TabPane
                  className="deprovisioning"
                  id="tabClick"
                  tab={
                    <div>
                      <span className="tab-num">6</span>Deprovisioning
                    </div>
                  }
                  disabled={this.state.employeeId !== "" ? false : true}
                  key="deprovision"
                >
                  <Deprovision
                    ref={this.refreshDeprovision}
                    tabObj={this.state}
                    permission={this.props.role}
                    changeNextTab={this.changeNextTab.bind(this)}
                  />
                </TabPane>
              </Tabs>
            ) : null}
            <div className="tab-nav-btns">
              <Button
                role="tab"
                onClick={this.prevTab.bind(this)}
                className="btn-cancel mr-3"
                size="large"
                shape="circle"
                icon="arrow-left"
                disabled={
                  this.state.openTab === "personalDetail" ? true : false
                }
              ></Button>
              <Button
                onClick={this.nextTab.bind(this)}
                role="tab"
                type="primary"
                shape="circle"
                icon="arrow-right"
                size="large"
                disabled={
                  this.state.employeeId === ""
                    ? true
                    : this.state.openTab === "deprovision"
                    ? true
                    : false
                }
              ></Button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }
}
const mapstateToProps = state => ({
  role: state
});
export default connect(mapstateToProps)(UpdateEmployee);
