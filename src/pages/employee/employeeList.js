import React from "react";
import {
  Card, Avatar, Row, Col, Progress, Button, Drawer,
  Menu, Icon, Checkbox, Divider, Slider, Input, Spin
} from 'antd';
import filter from '../../assets/filter.svg';
import { GenericApiService } from "../../Utils/GenericService";
import UrlConstant from "../../Utils/UrlConstant";
import { withRouter, Link } from "react-router-dom";
import { EncryptDecryptSessionStorageService } from "../../Utils/EncryptDecryptSessionStorageService";
import play from '../../assets/play.svg';
import tick from '../../assets/tick.svg';
import pause from '../../assets/pause.svg';
import upload from '../../assets/upload.svg';
import { commonService } from "../../Utils/ConvertintoByteArray";
import moment from "moment";

const { SubMenu } = Menu;
const { Search } = Input;


class EmployeeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      start: 0,
      limit: 7,
      totalcount: 0,
      dataSource: [],
      visible: false,
      departmentList: [],
      designationList: [],
      selectDepartments: [],
      selctedDepartmentNames: [],
      selectedDesignationNames: [],
      activeStatusList: [],
      selectedStatusList: [],
      showDesignations: false,
      onboardingSlider: false,
      // offboardingSlider: false,
      documentStartPercentage: '',
      documentEndPercentage: '',
      engagementStartPercentage: '',
      engagementEndPercentage: '',
      provisionStartPercentage: '',
      provisionEndPercentage: '',
      deprovisionStartPercentage: '',
      deprovisionEndPercentage: '',
      noDataMessage: '',
      loading: true,
      employeeDetail: {},
      engageStatusList: [],//engage List
      assetStatusList: [],//assest list
      deprovisionResponse: [],
      masterDocList: [],
      isDeprovisionStarted: false,
      isAllProvisionCompleted: false,
      statusList: [],
      validEmpStatus: false,
      disableStartDeprovisionButton: true
    }

    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
  }

  componentDidMount() {
    this.getAllEmployeeList(UrlConstant.employeeList + '?start=' + this.state.start + '&limit=' + this.state.limit + '&isActive=true&organisationId=' + this.orgId);
    this.getDepartmentList();
    this.getDocumentList();
    setTimeout(
      function () {
        this.onLoadAni();
      }
        .bind(this),
      1200
    );
  }
  onLoadAni() {
    var element = document.getElementById("empListTop");
    if (element != undefined) {
      element.classList.add("onload-ani");
    }
  }
  handleScroll = e => {
    var noShowDetailCard = this.state.dataSource.every(e => e.showDetail === false);
    if (noShowDetailCard === true) {
      let element = e.target
      // console.log('*'+ (Math.ceil(element.scrollHeight - element.scrollTop)))
      // console.log(element.clientHeight+'#')
      if (Math.ceil(element.scrollHeight - element.scrollTop) === element.clientHeight) {
        this.setState({ limit: this.state.limit + 5, loading: true });
        this.getAllEmployeeList(UrlConstant.employeeList + '?start=' + this.state.start + '&limit=' + this.state.limit + '&isActive=true&organisationId=' + this.orgId);
      }
    }
  }

  //to get employee list
  getAllEmployeeList(url) {
    GenericApiService.Post(url, '', false).then((response) => {
      if (response.data.length !== 0) {
        response.data.map((obj, index) => {
          obj.showDetail = false
          obj.showCard = true
          if (obj.isDeprovisionStarted == null) {
            obj.isDeprovisionStarted = false
          }
        });
        this.setState({
          dataSource: response.data,
          totalcount: response.totalResult,
          loading: false,
          noDataMessage: ''
        });
      }
      else {
        this.setState({
          noDataMessage: 'No Records Found'
        })
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }
  //department list
  getDepartmentList = () => {
    GenericApiService.Post(UrlConstant.getDepartmentList + '?organisationId=' + this.orgId, '').then((response) => {
      if (response.status.success === 'Success') {
        this.setState({
          departmentList: response.data
        });
      }
    })
  }


  getEmployeeDetail = (selectedEmployee) => {
    this.setState({ isDeprovisionStarted: false, isAllProvisionCompleted: false })
    this.state.dataSource.forEach((data) => {
      if (data.employeeId === selectedEmployee.employeeId) {
        data.showDetail = !data.showDetail;
        if (data.showDetail == true) {
          this.callGetEmployeeDetailApi(selectedEmployee.employeeId);
        }
      } else {
        data.showCard = !data.showCard;
      }
    })
    this.setState({
      dataSource: this.state.dataSource
    })
  }

  //for filter
  openfilters = () => {
    this.setState({
      visible: true,
    });
  }
  onClose = () => {
    this.setState({
      visible: false,
    });
  };

  onSelectDepartment = (e) => {




    if (e.target.checked === true) {

      this.state.selectDepartments.push(e.target.value);
      this.state.selctedDepartmentNames.push(e.target.name)

      var url = UrlConstant.getDesignationList + 'organisationId=' + this.orgId
      var payload = this.state.selectDepartments

      GenericApiService.Post(url, payload).then((response) => {
        if (response.data !== " " && response.data !== null) {

          var uniq = {};
          this.designations = response.data
          var temp = this.designations.filter(e => !uniq[e.name] && (uniq[e.name] = true));



          this.setState({
            designationList: temp,
            showDesignations: true
          })
        }
      })
    }
    else {
      this.state.selectDepartments.splice(
        this.state.selectDepartments.findIndex(v => v === e.target.value),
        1)
      this.state.selctedDepartmentNames.splice(
        this.state.selctedDepartmentNames.findIndex(v => v === e.target.name),
        1)
      var url = UrlConstant.getDesignationList + 'organisationId=' + this.orgId
      var payload = this.state.selectDepartments

      GenericApiService.Post(url, payload).then((response) => {
        if (response.data !== " " && response.data !== null) {

          var uniq = {};
          this.designations = response.data

          var temp = this.designations.filter(e => !uniq[e.name] && (uniq[e.name] = true));



          this.setState({

            designationList: temp,
            showDesignations: true

          })
        }
        else {
          this.setState({

            designationList: '',
            showDesignations: false

          })

        }

      })




      this.setState({

        selectDepartments: this.state.selectDepartments,
        selctedDepartmentNames: this.state.selctedDepartmentNames
      })

    }
    if (this.state.selectDepartments.length === 0) {
      this.setState({
        showDesignations: false
      })
    }
  }

  onSelectDesignation = (e) => {
    if (e.target.checked === true) {
      this.state.selectedDesignationNames.push(e.target.value);
    } else {
      this.state.selectedDesignationNames.splice(
        this.state.selectedDesignationNames.findIndex(v => v === e.target.value),
        1)

    }

    this.setState({
      selectedDesignationNames: this.state.selectedDesignationNames
    })
  }

  onSelectStatus = (e) => {
    var previousList = this.state.selectedStatusList
    var newList = []
    if (e.target.checked === true) {
      newList = previousList.concat(e.target.value)
    } else {
      var toRemove = []
      toRemove = e.target.value
      newList = previousList
      newList = previousList.filter(element => !toRemove.includes(element))
      this.setState({
        documentStartPercentage: '',
        documentEndPercentage: '',
        engagementStartPercentage: '',
        engagementEndPercentage: "",
        provisionStartPercentage: "",
        provisionEndPercentage: "",
        deprovisionStartPercentage: "",
        deprovisionEndPercentage: "",

      })
    }
    this.setState({
      selectedStatusList: newList
    }, () => {
    })

    if (e.target.value === 'Onboarding' && e.target.checked === true) {
      this.setState({
        onboardingSlider: true
      })

    }
    else if (e.target.value === 'Onboarding' && e.target.checked === false) {
      this.setState({
        onboardingSlider: false
      })
    }
    // if (e.target.value === 'Offboarding' && e.target.checked === true) {
    //   this.setState({
    //     offboardingSlider: true

    //   })

    // } else if (e.target.value === 'Offboarding' && e.target.checked === false) {
    //   this.setState({
    //     offboardingSlider: false
    //   })
    // }
  }
  onChangePercentage = (start, end, e) => {
    this.setState({
      [start]: e[0],
      [end]: e[1],

    })
  }
  onSearchList = () => {

    var url = UrlConstant.searchEmpByParms + 'organisationId=' + this.orgId
    var payload = {
      "departmentNames": this.state.selctedDepartmentNames,
      "designationNames": this.state.selectedDesignationNames,
      "statusList": this.state.selectedStatusList,
      "documentStartPercentage": this.state.documentStartPercentage,
      "documentEndPercentage": this.state.documentEndPercentage,
      "engagementStartPercentage": this.state.engagementStartPercentage,
      "engagementEndPercentage": this.state.engagementEndPercentage,
      "provisionStartPercentage": this.state.provisionStartPercentage,
      "provisionEndPercentage": this.state.provisionEndPercentage,
      "deprovisionStartPercentage": this.state.deprovisionStartPercentage,
      "deprovisionEndPercentage": this.state.deprovisionEndPercentage
    }
    GenericApiService.Post(url, payload).then((response) => {
      if (response.data.length > 0) {
        response.data.map((obj, index) => {
          obj.showDetail = false
          obj.showCard = true
        });
        this.setState({
          dataSource: response.data,
          totalcount: response.totalResult,

          loading: false,
          noDataMessage: '',
          visible: false,
        });
      }
      else {
        this.setState({
          noDataMessage: 'No Records Found'
        })
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }

  //employee Detail
  callGetEmployeeDetailApi(eid) {
    GenericApiService.Post(UrlConstant.employeeById + '?employeeId=' + eid, '', false).then((response) => {

      if (response.data.length !== 0 && response.status.success === 'Success') {
        this.setState({
          employeeDetail: response.data,
        }, () => { this.getDoc(); });

        if (this.state.employeeDetail.employee.isDeprovisionStarted == null) {
          this.setState({ isDeprovisionStarted: false })
        }
        else {
          this.setState({ isDeprovisionStarted: this.state.employeeDetail.employee.isDeprovisionStarted })
        }
        if (this.state.employeeDetail.provisionList.length != 0) {
          var isAllProvisionCompleted = this.state.employeeDetail.provisionList.every(e => e.provisionStatus.name == 'Completed');
          this.setState({
            isAllProvisionCompleted: isAllProvisionCompleted
          })
        }
        //checking employee status (notice or terminated) to  start deprovision
        if (response.data.employee.status.name == 'Under Notice Period' || response.data.employee.status.name == 'Terminated') {
          this.setState({
            validEmpStatus: true
          })
        }

        if (this.state.isAllProvisionCompleted == true && this.state.validEmpStatus === true) {
          this.setState({ disableStartDeprovisionButton: false })
        }
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }

  getDoc() {
    var tempuploadedMandatoryDocList = [];
    //filter the mandatory object from  an array
    if (this.state.employeeDetail.documentDetailList !== undefined) {
      this.state.employeeDetail.documentDetailList.forEach((e) => {
        if (e.document.isManditory === true) {
          tempuploadedMandatoryDocList.push(e);
        }
      })
    }
    //filter if same folder name occur in different uploaded document
    var uniq = {};
    var uploadedMandatoryDocList = tempuploadedMandatoryDocList.filter(e => !uniq[e.document.folderName] && (uniq[e.document.folderName] = true));

    for (let e of this.state.masterDocList) {
      e.hasDoc = false;
      e.updatedDocumentPath = null
      for (let e1 of uploadedMandatoryDocList) {
        if (e.folderName === e1.document.folderName) {
          e.hasDoc = true;
          e.updatedDocumentPath = e1.documentPath
        }
      }
    }
    this.setState({
      masterDocList: this.state.masterDocList
    })
  }
  //on start deprovision btn click
  startDeprovision() {
    GenericApiService.Post(UrlConstant.startDeprovision + '?employeeId=' + this.state.employeeDetail.employee.employeeId + '&isDeprovisionStarted=true', '', true).then((response) => {
      if (response.status.success == 'Success') {
        this.callGetEmployeeDetailApi(this.state.employeeDetail.employee.employeeId);
      }
    })
  }

  //to get actual assest list
  getStatusList(event, newStatus, category, categoryUrl) {
    GenericApiService.GetAll(UrlConstant.statusList + '?statusCategory=' + categoryUrl).then((response) => {
      if (response.data.length !== 0 && response.status.success == 'Success') {
        this.setState({
          statusList: response.data
        });
        if (category == 'provision') {
          this.saveProvision(event, newStatus);
        }
        if (category == 'engage') {
          this.saveEngage(event, newStatus);
        }
        if (category == 'deprovision') {
          this.saveDeprovision(event, newStatus);
        }
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }
  getDocumentList() {
    GenericApiService.Post(UrlConstant.employeeDocumentList + '?organisationId=' + this.orgId, '', false).then((response) => {
      if (response.data.length !== 0 && response.status.success == 'Success') {
        this.setState({
          masterDocList: response.data,
        });
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }
  //save Provision status
  saveProvision(e, changeStatus) {
    this.setState({ loading: true })
    let requestPayload;
    let changeStatusId;

    requestPayload = e;
    this.state.statusList.forEach((as) => {
      if (as.name == changeStatus) {
        changeStatusId = as.statusId;
      }
    });
    requestPayload.provisionStatus = {
      "statusId": changeStatusId
    };
    requestPayload.employee = {
      "employeeId": requestPayload.employee.employeeId
    };
    requestPayload.assetCategory = {
      "assetCategoryId": requestPayload.assetCategory.assetCategoryId
    };

    delete requestPayload.deprovisionStatus;
    delete requestPayload.returnedDate;

    requestPayload.updatedOn = new Date();
    requestPayload.isDeprovision = false;
    GenericApiService.Post(UrlConstant.saveAsset, requestPayload, true).then((response) => {
      if (response.status.success == 'Success') {
        this.callGetEmployeeDetailApi(this.state.employeeDetail.employee.employeeId);
        this.setState({
          statusList: [],
          loading: false
        })
      }
    }).catch(function (err) {
      return console.log(err);
    });
    this.setState({
      loading: false
    })
  }

  //save deprovision
  saveDeprovision(e, changeStatus) {
    this.setState({ loading: true })
    let requestPayload;
    let changeStatusId;

    requestPayload = e;
    this.state.statusList.forEach((as) => {
      if (as.name == changeStatus) {
        changeStatusId = as.statusId;
      }
    });
    requestPayload.deprovisionStatus = {
      "statusId": changeStatusId
    };
    requestPayload.provisionStatus = {
      "statusId": requestPayload.provisionStatus.statusId
    };
    requestPayload.employee = {
      "employeeId": requestPayload.employee.employeeId
    };
    requestPayload.assetCategory = {
      "assetCategoryId": requestPayload.assetCategory.assetCategoryId
    };
    requestPayload.updatedOn = new Date();
    requestPayload.isDeprovision = true;
    GenericApiService.Post(UrlConstant.saveAsset, requestPayload, true).then((response) => {
      if (response.status.success == 'Success') {
        this.getDeprovisionList();
        this.callGetEmployeeDetailApi(this.state.employeeDetail.employee.employeeId);
        this.setState({
          statusList: [],
          loading: false
        })
      }
    }).catch(function (err) {
      return console.log(err);
    });
    this.setState({
      loading: false
    })
  }

  //save engage status
  saveEngage = (e, status) => {
    this.setState({ loading: true })
    let requestPayload;
    let changeStatusId;
    requestPayload = e;
    this.state.statusList.forEach((e) => {
      if (e.name == status) {
        changeStatusId = e.statusId;
      }
    });

    requestPayload.status = {
      "statusId": changeStatusId
    };
    requestPayload.department = {
      "departmentId": requestPayload.department.departmentId
    };
    requestPayload.employee = {
      "employeeId": requestPayload.employee.employeeId
    };
    requestPayload.engagementCategory = {
      "engagementCategoryId": requestPayload.engagementCategory.engagementCategoryId
    };
    requestPayload.updatedOn = new Date();

    GenericApiService.Post(UrlConstant.saveEngagement, requestPayload, true).then((response) => {
      if (response.status.success == 'Success') {
        this.callGetEmployeeDetailApi(this.state.employeeDetail.employee.employeeId);
        this.setState({
          statusList: [],
          loading: false
        })
      }
    }).catch(function (err) {
      return console.log(err);
    });
    this.setState({
      loading: false
    })
  }

  searchEmployee(e) {
    this.getAllEmployeeList(UrlConstant.employeeList + '?start=' + this.state.start + '&limit=' + this.state.limit + '&isActive=true&organisationId=' + this.orgId + '&search=' + e.target.value);
  }
  render() {
    function formatter(value) {
      return `${value}%`;
    }
    const empDet = this.state.employeeDetail.employee;

    return (
      <div id="empListTop">
        <Drawer

          title="Filter"
          placement="right"
          closable={true}
          onClose={this.onClose}
          visible={this.state.visible}
        >

          <Menu
            onClick={this.handleClick}
            style={{ width: 230 }}
            mode="inline"
          >
            <SubMenu
              key="1"
              title={
                <span>

                  <span>Department</span>
                </span>
              }
            >
              {this.state.departmentList !== '' ? (
                <div>
                  {this.state.departmentList.map((department, index) => {
                    return (
                      <Col key={index} style={{ margin: 20 }}>
                        <Checkbox onChange={this.onSelectDepartment} name={department.name} value={department} > {department.name}</Checkbox>
                      </Col>
                    )
                  }
                  )}
                </div>
              ) : (null)}

            </SubMenu>

            {this.state.showDesignations === true ? (


              <SubMenu
                key="2"
                title={
                  <span>

                    <span>Designation</span>
                  </span>
                }
              >

                {this.state.designationList.length > 0 ? (

                  <div>

                    {this.state.designationList.map((designation, index) => {
                      return (
                        <Col key={index} style={{ margin: 20 }}>
                          <Checkbox value={designation.name} onChange={this.onSelectDesignation} > {designation.name}</Checkbox>
                        </Col>


                      )
                    }
                    )}
                  </div>
                ) : (null)}

              </SubMenu>

            ) : (null)}

            <SubMenu
              key="3"
              title={
                <span>

                  <span>Status</span>
                </span>
              }
            >
              <div>
                <Col style={{ margin: 20 }}>
                  <Checkbox value={["In Probation", "Confirmed", "Contract", "Notice Period"]} onChange={this.onSelectStatus}>Active</Checkbox>
                </Col>


                <Col style={{ margin: 20 }}>
                  <Checkbox value={["Termination", "Relieved"]} onChange={this.onSelectStatus}>Inactive</Checkbox>
                </Col>

                <Col style={{ margin: 20 }}>
                  <Checkbox value="Onboarding" onChange={this.onSelectStatus}>Onboarding</Checkbox>
                </Col>
                {this.state.onboardingSlider === true ? (
                  <Col style={{ margin: 20 }}>
                    <p>Documentation</p>
                    <Slider tipFormatter={formatter} range
                      name='Documentation' onChange={this.onChangePercentage.bind(this, 'documentStartPercentage', 'documentEndPercentage')} />
                    <p>Training</p>
                    <Slider tipFormatter={formatter} range name='Training' onChange={this.onChangePercentage.bind(this, 'engagementStartPercentage', 'engagementEndPercentage')} />
                    <p>Probation</p>
                    <Slider tipFormatter={formatter} range name='Probation' onChange={this.onChangePercentage.bind(this, 'provisionStartPercentage', 'provisionEndPercentage')} />
                  </Col>
                ) : (null)}
                {/* <Col style={{ margin: 20 }}>
                <Checkbox value="Offboarding" onChange={this.onSelectStatus}>Offboarding</Checkbox>
              </Col> */}
                {/* {this.state.offboardingSlider === true ? (
                <Col style={{ margin: 20 }}>
                  <p>Deprovision</p>
                  <Slider tipFormatter={formatter} range name='Deprovision' onChange={this.onChangePercentage.bind(this, 'deprovisionStartPercentage', 'deprovisionEndPercentage')} range defaultValue={[5, 100]} />
                </Col>
              ) : (null)} */}
              </div>
            </SubMenu>

          </Menu>
          <div className="drawer-footer">
            <Button className="cancel-btn" shape="round" onClick={this.onClose} style={{ margin: 10 }}>Cancel</Button>
            <Button type="primary" shape="round" className="login-btn" onClick={this.onSearchList} style={{ margin: 10 }}> Search </Button>
          </div>
        </Drawer>
        {/* blue shape */}
        <div className="blue-shape">

        </div>
        <div className="emplyoee-list-top">
          <div className="add-emplyoee">
            {this.props.permission !== undefined ?
              this.props.permission.empPermission.isCreate == true ?
                <Button type="primary" htmlType="submit" shape="round" className='btn-with-icon' icon="plus" onClick={() => { this.props.history.push('/home/updateEmployee/?employee=new') }}>
                  Add Employee
            </Button>
                : null
              : null}
          </div>
          <div className="search-employee">
            <div className="search-by">
              <Search
                placeholder="Search Employees"
                onChange={(value) => this.searchEmployee(value)}
                onKeyPress={(e) => { commonService.removeFocus(this.refs, e) }}
                ref="input"
                style={{ width: 190 }}
              />
            </div>
            <div className="sort-by">
              <span className="title">Sort By:</span>
              <span className="sorting" onClick={() => { this.getAllEmployeeList(UrlConstant.employeeList + '?start=' + this.state.start + '&limit=' + this.state.limit + '&isActive=true&organisationId=' + this.orgId + '&sortBy=dateOfJoin'); this.setState({ loading: true }) }}>DOJ <span className="sorting-icons"><Icon type="caret-up" /><Icon type="caret-down" /></span></span>
              <span className="sorting" onClick={() => { this.getAllEmployeeList(UrlConstant.employeeList + '?start=' + this.state.start + '&limit=' + this.state.limit + '&isActive=true&organisationId=' + this.orgId + '&sortBy=departmentName'); this.setState({ loading: true }) }}>Department <span className="sorting-icons"><Icon type="caret-up" /><Icon type="caret-down" /></span></span>
              <span className="sorting" onClick={() => { this.getAllEmployeeList(UrlConstant.employeeList + '?start=' + this.state.start + '&limit=' + this.state.limit + '&isActive=true&organisationId=' + this.orgId + '&sortBy=employeeCode'); this.setState({ loading: true }) }}>Employee ID <span className="sorting-icons"><Icon type="caret-up" /><Icon type="caret-down" /></span></span>
            </div>

            <div className="filter-by">
              <img src={filter} onClick={this.openfilters} />
            </div>
          </div>
        </div>

        {!this.state.noDataMessage ? (
          <Spin spinning={this.state.loading} delay={500}>
            <div className="employee-list" onScroll={this.handleScroll}>

              {this.state.dataSource.map((value, index) => (
                <div className={`card ${value.showDetail === true ? ' ani' : ''}`} key={index} >
                  {value.showCard == true ?
                    <div className="card-title" onClick={() => this.getEmployeeDetail(value)}>
                      <div className="col emp-profile pl-0">
                        {value.profileUrl !== null ?
                          <Avatar src={value.profileUrl} size={60}></Avatar> :
                          <Avatar size={60}>{value.firstName !== null ? value.firstName.charAt(0).toUpperCase() : null}</Avatar>}
                        <div className="emp-info">
                          <span className="emp-name">{value.firstName !== null ? value.firstName : null}</span>
                          <span className="emp-designation">{value.departmentName !== null ? value.departmentName : null}</span>
                        </div>
                      </div>
                      <div className="col email">
                        <span className="title">Email ID</span>
                        <span>{value.officialEmail}</span>
                      </div>
                      <div className="col doj">
                        <span className="title">DOJ</span>
                        <span>{value.dateOfJoin ? moment(value.dateOfJoin).format("DD-MM-YYYY"):'-'}</span>
                      </div>
                      <div className="col emp-id">
                        <span className="title">Employee ID</span>
                        <span>{value.employeeCode}</span>
                      </div>
                      <div className="col docs">
                        {value.isDeprovisionStarted !== true ? <div>
                          <span className="title">Documentation</span>
                          <span><Progress percent={value.documentationPercent == null ? 0 : value.documentationPercent} status="active" size="small" /></span>
                        </div>
                          : null}
                        {value.isDeprovisionStarted === true ? <div>
                          <span className="title">Deprovision</span>
                          <span><Progress percent={value.deprovisionPercent == null ? 0 : value.deprovisionPercent} status="active" size="small" /></span>
                        </div> : null}
                      </div>
                      <div className="col provision">
                        {value.isDeprovisionStarted !== true ? <div>
                          <span className="title">Provisioning</span>
                          <span><Progress percent={value.provisionPercent == null ? 0 : value.provisionPercent} status="active" size="small" /></span>
                        </div>
                          : null}
                      </div>
                      <div className="col training pr-0">
                        {value.isDeprovisionStarted !== true ? <div>
                          <span className="title">Training</span>
                          <span><Progress percent={value.engagementPercent == null ? 0 : value.engagementPercent} status="active" size="small" /></span>
                        </div> : null}
                      </div>
                    </div> : null}
                  {/* employee details */}
                  <div className="card-body employee-details">
                    {value.showDetail === true && empDet !== undefined ?
                      <div className="row h-100 animated faster fadeInDown">
                        <div className="col-xl-4 personal-details">
                          <div className="row">
                            <span className="col-md-6 label-title">DOB:</span>
                            <span className="col-md-6 label-content">{empDet.dateOfBirth ? moment(empDet.dateOfBirth).format("DD-MM-YYYY") : '-'}</span>
                          </div>
                          <div className="row">
                            <span className="col-md-6 label-title">Contact Number:</span>
                            <span className="col-md-6 label-content">{empDet.personalContactNo != null ? empDet.personalContactNo : '-'}</span>
                          </div>
                          <div className="row">
                            <span className="col-md-6 label-title">Gender:</span>
                            <span className="col-md-6 label-content">{empDet.gender}</span>
                          </div>
                          <div className="row">
                            <span className="col-md-6 label-title">Current Address:</span>
                            <span className="col-md-6 label-content">
                              {empDet.presentAddress !== null ?
                                <span>
                                  {empDet.presentAddress.doorNo !== undefined ? empDet.presentAddress.doorNo + ',' : null}
                                  {empDet.presentAddress.city != undefined ? empDet.presentAddress.city + ',' : null}
                                  {empDet.presentAddress.state != undefined ? empDet.presentAddress.state + ',' : null}
                                  {empDet.presentAddress.pinCode != undefined ? empDet.presentAddress.pinCode : null}</span>
                                : <span>-</span>}
                            </span>
                          </div>
                          <div className="row">
                            <span className="col-md-6 label-title">Permanent Address:</span>
                            <span className="col-md-6 label-content">
                              {empDet.permanentAddress !== null ?
                                <span>
                                  {empDet.permanentAddress.doorNo !== undefined ? empDet.permanentAddress.doorNo + ',' : null}
                                  {empDet.permanentAddress.city != undefined ? empDet.permanentAddress.city + ',' : null}
                                  {empDet.permanentAddress.state != undefined ? empDet.permanentAddress.state + ',' : null}
                                  {empDet.permanentAddress.pinCode != undefined ? empDet.permanentAddress.pinCode : null}</span>
                                : <span>-</span>}
                            </span>
                          </div>
                          <div className="row">
                            <span className="col-md-6 label-title">Status:</span>
                            <span className="col-md-6 label-content">{empDet.status.name != null ? empDet.status.name : '-'}</span>
                          </div>
                          <div className="row">
                            <span className="col-md-6 label-title">Reporting Manager:</span>
                            <span className="col-md-6 label-content">{empDet.reportingManager !== null ? empDet.reportingManager.firstName : '-'}</span>
                          </div>
                        </div>
                        <div className="col-xl-8 official-details">
                          {this.props.permission !== undefined ?
                            this.props.permission.empPermission.isEdit == true ?
                              <Link to={"/home/updateEmployee/?employee=" + empDet.employeeId}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14.005" height="14.005" viewBox="0 0 14.005 14.005"><path class="a" d="M0,0H14V14H0Z" /><path class="b" d="M9.454,6.513l.537.537L4.7,12.337H4.167V11.8L9.454,6.513M11.555,3a.584.584,0,0,0-.408.169L10.078,4.237l2.188,2.188,1.068-1.068a.581.581,0,0,0,0-.823L11.969,3.169A.573.573,0,0,0,11.555,3Zm-2.1,1.861L3,11.315V13.5H5.188L11.642,7.05,9.454,4.861Z" transform="translate(-1.249 -1.249)" /></svg> Edit Details</Link> : null : null}
                          {this.state.isDeprovisionStarted !== true ? <h5>Documentation</h5> : null}
                          {this.state.isDeprovisionStarted !== true ?
                            <div className="docs-row">
                              {this.state.masterDocList.map((e, index) => {
                                return (
                                  <div key={index} >
                                    {e.isManditory !== false ?
                                      <div className={`base-class ${e.hasDoc == true ? 'details-box completed ' : 'details-box'}`}>
                                        {/* <img src={e.documentUrl !== undefined ? e.documentUrl : null} /> */}
                                        <Avatar shape="square" src={e.updatedDocumentPath !== null ? e.updatedDocumentPath : e.documentUrl} size="large" />

                                        <span>{e.folderName}</span>

                                        {e.hasDoc == false ?
                                          <div className="hover-box">
                                            <div>
                                              <img src={upload} onClick={() => this.props.history.push('/home/updateEmployee/?ot=document&employee=' + this.state.employeeDetail.employee.employeeId)} />
                                              <span>upload</span>
                                            </div>
                                          </div>
                                          :
                                          //   <div className="hover-box">     
                                          //    <div>                                      
                                          //       <img src={tick} />
                                          //       <span>Completed</span>    
                                          //   </div>                                                                            
                                          // </div>

                                          <div className="completed-icon" >
                                            <Icon type="check" />
                                          </div>

                                        }
                                      </div> : null
                                    }
                                  </div>
                                )
                              })}
                              <div onClick={() => this.props.history.push('/home/updateEmployee/?ot=document&employee=' + empDet.employeeId)} className="details-box addNew" style={{ borderStyle: 'dashed' }}>
                                <span>Add New</span>
                              </div>


                            </div> : null}
                          {this.state.isDeprovisionStarted !== true ?
                            <div>
                              <h5>Provisioning</h5>

                              {this.state.employeeDetail.provisionList !== undefined && this.state.employeeDetail.provisionList.length !== 0 ?
                                <div className="docs-row">
                                  {this.state.employeeDetail.provisionList.map((e, index) => {
                                    return (
                                      <div key={index} className={`base-class ${e.provisionStatus.name == 'Completed' ? 'details-box completed' : 'details-box'}`}>

                                        <span>{e.name}</span>
                                        <span>  {e.provisionStatus.name}</span>

                                        {e.provisionStatus.name === 'Completed' ?
                                          <div className="completed-icon" >
                                            <Icon type="check" />
                                          </div>
                                          : null}

                                        {e.provisionStatus.name === 'Inprogress' ?
                                          <div>
                                            <div className="hover-box">
                                              <div>
                                                <img src={tick} onClick={() => this.getStatusList(e, 'Completed', 'provision', 'Asset')} />
                                                <span>Completed</span>
                                              </div>
                                              <div>
                                                <img src={pause} onClick={() => this.getStatusList(e, 'Onhold', 'provision', 'Asset')} />
                                                <span>OnHold</span>
                                              </div>
                                            </div>
                                          </div>
                                          : null}

                                        {e.provisionStatus.name === 'Onhold' ?
                                          <div>
                                            <div className="hover-box">
                                              <div>
                                                <img src={play} onClick={() => this.getStatusList(e, 'Inprogress', 'provision', 'Asset')} />
                                                <span>start</span>
                                              </div>
                                              <div>
                                                <Icon type="close-circle" onClick={() => this.getStatusList(e, 'Rejected', 'provision', 'Asset')} />
                                                <span>Rejected</span>
                                              </div>
                                            </div>
                                          </div>
                                          : null}
                                        {e.provisionStatus.name === 'Rejected' ?
                                          <div>
                                            <div className="hover-box">
                                              <div>
                                                <img src={play} onClick={() => this.getStatusList(e, 'Inprogress', 'provision', 'Asset')} />
                                                <span>start</span>
                                              </div>
                                            </div>
                                          </div> : null}
                                        {e.provisionStatus.name === 'Approved' ?
                                          <div>
                                            <div className="hover-box">
                                              <div>
                                                <Icon type="close-circle" onClick={() => this.getStatusList(e, 'Rejected', 'provision', 'Asset')} />
                                                <span>Rejected</span>
                                              </div>
                                              <div>
                                                <img src={tick} onClick={() => this.getStatusList(e, 'Completed', 'provision', 'Asset')} />
                                                <span>Completed</span>
                                              </div>
                                            </div>
                                          </div>
                                          : null}
                                      </div>

                                    )
                                  })}
                                </div> : <div className="docs-row"> No record found</div>}
                            </div>
                            : null}
                          {this.state.isDeprovisionStarted !== true ?
                            <div>
                              <h5>Training</h5>
                              {this.state.employeeDetail.engagementList !== undefined && this.state.employeeDetail.engagementList.length !== 0 ?

                                <div className="docs-row">
                                  {this.state.employeeDetail.engagementList.map((e, index) => {
                                    return (
                                      <div key={index} className={`base-class ${e.status.name == 'Completed' ? 'details-box completed ' : 'details-box'}`}>

                                        <span>{e.name}</span>
                                        <span>{e.status.name}</span>

                                        {e.status.name === 'Inprogress' ?
                                          <div className="hover-box">
                                            <div>
                                              <img src={pause} onClick={() => this.getStatusList(e, 'Onhold', 'engage', 'engagement')} />
                                              <span>On Hold</span>
                                            </div>
                                            <div>
                                              <img src={tick} onClick={() => this.getStatusList(e, 'Completed', 'engage', 'engagement')} />
                                              <span>Completed</span>
                                            </div>
                                          </div>
                                          : null
                                        }
                                        {e.status.name === 'Onhold' ?
                                          <div className="hover-box">
                                            <div>
                                              <img src={play} onClick={() => this.getStatusList(e, 'Inprogress', 'engage', 'engagement')} />
                                              <span>Start</span>
                                            </div>
                                          </div>
                                          : null
                                        }
                                        {e.status.name == 'Completed' ?
                                          <div className="completed-icon" >
                                            <Icon type="check" />
                                          </div>
                                          : null}

                                      </div>)
                                  })}

                                </div> : <div className="docs-row"> No record found</div>}
                            </div>
                            : null}




                          {this.state.isDeprovisionStarted !== true ?
                            <Button type="primary" disabled={this.state.disableStartDeprovisionButton} htmlType="submit" shape="round" className='login-btn' onClick={() => { this.startDeprovision() }}>
                              Start Deprovisioning
                         </Button>
                            : null}
                          {this.state.isDeprovisionStarted === true && this.state.isAllProvisionCompleted === true ?
                            <div>
                              <h5>Deprovisioning</h5>
                              {this.state.employeeDetail.deprovisionList.length > 0 ?
                                <div className="docs-row">
                                  {this.state.employeeDetail.deprovisionList.map((e, index) => {
                                    return (
                                      <div key={index} className={`${e.deprovisionStatus.name == 'Good to relieve' ? 'details-box completed' : 'details-box'}`}>
                                        <span>{e.name}</span>
                                        <span>{e.deprovisionStatus.name}</span>

                                        {e.deprovisionStatus.name == 'Good to relieve' ?
                                          <div className="completed-icon" >
                                            <Icon type="check" />
                                          </div>
                                          : null}

                                        {e.deprovisionStatus.name == 'Yet to recieve' ?
                                          <div>
                                            <div className="hover-box">
                                              <div>
                                                <img src={tick} onClick={() => this.getStatusList(e, "Good to relieve", 'deprovision', 'DEPROVISION')} />
                                                <span>Complete</span>
                                              </div>
                                            </div>
                                          </div>
                                          : null}
                                      </div>
                                    )
                                  })}
                                </div>
                                : <div className="docs-row"> No record found</div>}

                            </div>
                            : null}
                        </div>
                      </div>
                      : null}
                  </div>

                </div>
              ))}
            </div>
          </Spin>
        ) : (
            <div style={{ marginTop: 50 }} >

              <p style={{ textAlign: 'center' }}> No Records </p>
            </div>
          )}
      </div>

    );
  }
}

export default withRouter(EmployeeList);

