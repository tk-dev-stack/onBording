import React from "react";
import queryString from 'query-string';
import {  Spin, Avatar, Row, Col, Progress, Button, Icon } from 'antd';
import { withRouter } from "react-router-dom";
import UrlConstant from "../../Utils/UrlConstant";
import { GenericApiService } from "../../Utils/GenericService";
import marksheet from '../../assets/marksheet.png';
import play from '../../assets/play.svg';
import tick from '../../assets/tick.svg';
import pause from '../../assets/pause.svg';
import upload from '../../assets/upload.svg';
import { connect } from 'react-redux';
import { EncryptDecryptSessionStorageService } from "../../Utils/EncryptDecryptSessionStorageService";
import RoleStore from "../../store/roleStore";



class EmployeeDetail extends React.Component {
  componentDidMount() {
    const value = new queryString.parse(this.props.location.search);
    this.getEmployeeById(value.employeeId);
    this.getDocumentList();
  }

  constructor(props) {
    super(props);
    this.orgId=EncryptDecryptSessionStorageService.getSessionStorage('orgId');
    this.state = {
      employeeDetail: {},
      engageStatusList: [],//engage List
      assetStatusList: [],//assest list
      mandatoryDocList: [],//uploaded mandatory doc
      deprovisionResponse:[],
      documentList:[],
      loading: true,
      isDeprovision: false,
      isAllProvisionCompleted:false,
      statusList:[]
    }
  }
  getDeprovisionList(){
    GenericApiService.Post(UrlConstant.employeeAssestList +  '?start=0&limit=10&organisationId='+this.orgId+'&type=DEPROVISION&employeeId='+this.state.employeeId, '', false).then((response) => {
      if (response.data.length !== 0 && response.status.success === 'Success') {
        this.setState({
          deprovisionResponse: response.data
        })
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }

  //on start deprovision btn click
  startDeprovision(){
   GenericApiService.Post(UrlConstant.startDeprovision+'?employeeId='+this.state.employeeDetail.employee.employeeId+'&isDeprovisionStarted=true','',true).then((response)=>{
     if(response.status.success=='Success'){
      this.getEmployeeById(this.state.employeeId);
     }
  })
    
  }

  //get employee by id
  getEmployeeById(eid) {
    GenericApiService.Post(UrlConstant.employeeById + '?employeeId=' + eid, '', false).then((response) => {
      if (response.data.length !== 0 && response.status.success == 'Success') {
        this.setState({
          employeeDetail: response.data,
          employeeId: response.data.employee.employeeId,
          loading: false
        });
        if(this.state.employeeDetail.employee.isDeprovisionStarted===true&&this.state.employeeDetail.employee.isDeprovisionStarted!==undefined){
          this.setState({isDeprovision:true})
        }
        else{
          this.setState({isDeprovision:false})
        }
        if(this.state.employeeDetail.provisionList.length!=0){
          var isAllProvisionCompleted=  this.state.employeeDetail.provisionList.every(e=>e.provisionStatus.name=='COMPLETED');
          this.setState({
            isAllProvisionCompleted: isAllProvisionCompleted
           })
        } 
        this.getDoc();
        this.getDeprovisionList();

      }
    }).catch(function (err) {
      return console.log(err);
    });
  }

  getDoc() {
    var mandatoryDocList = [];
    //filter the mandatory object from  an array
    this.state.employeeDetail.documentDetailList.forEach((e) => {
      if (e.document.isManditory == true) {
        mandatoryDocList.push(e);
      }
    })
    //filter if same folder name occur dont add new one
    var uniq = {};

    var temp = mandatoryDocList.filter(e => !uniq[e.document.folderName] && (uniq[e.document.folderName] = true));
    this.setState({
      mandatoryDocList: temp
    });

    for(let e of this.state.documentList){
      e.hasDoc=false;
      for(let e1 of this.state.mandatoryDocList){
       if(e.folderName==e1.document.folderName){
         e.hasDoc=true;
       }
      }
    }
    this.setState({
      documentList:this.state.documentList
    })
  }

 //to get actual assest list
 getStatusList(event,newStatus,category,categoryUrl) {
  GenericApiService.GetAll(UrlConstant.statusList + '?statusCategory='+categoryUrl).then((response) => {
    if (response.data.length !== 0 && response.status.success == 'Success') {
      this.setState({
        statusList:response.data
         });  
         if(category=='provision'){
          this.saveProvision(event,newStatus);
         }
         if(category=='engage'){
           this.saveEngage(event,newStatus);
         }
         if(category=='deprovision'){
           this.saveDeprovision(event,newStatus);
         }
          }
  }).catch(function (err) {
    return console.log(err);
  });
}

 getDocumentList(){
  GenericApiService.Post(UrlConstant.employeeDocumentList + '?organisationId='+this.orgId,'',false).then((response) => {
    if (response.data.length !== 0 && response.status.success == 'Success') {
      this.setState({
       documentList: response.data,
      });
    }
  }).catch(function (err) {
    return console.log(err);
  });
 }

  editEmployee = () => {
    this.props.history.push('/home/updateEmployee/?employee=' + this.state.employeeDetail.employee.employeeId);
  }

  goDashboard = () => {
    this.props.history.push('/home');
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
    requestPayload.isDeprovision = false ;
    GenericApiService.Post(UrlConstant.saveAsset, requestPayload, true).then((response) => {
      if (response.status.success == 'Success') {
        this.getEmployeeById(this.state.employeeId);
        this.setState({
          statusList:[],
          loading:false
        })
      }
    }).catch(function (err) {
      return console.log(err);
    });
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
  requestPayload.isDeprovision = true ;
  GenericApiService.Post(UrlConstant.saveAsset, requestPayload, true).then((response) => {
    if (response.status.success == 'Success') {
      this.getDeprovisionList();
      this.getEmployeeById(this.state.employeeId);
      this.setState({
        statusList:[],
        loading:false
      })
    }
  }).catch(function (err) {
    return console.log(err);
  });
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
        this.getEmployeeById(this.state.employeeId);
        this.setState({
          statusList:[]
        })
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }


  deprovisionDetail() {
    return (<div>

      {this.state.deprovisionResponse.length !== 0  ?
          <div className="row">
          <div>
            <span style={{ color: 'grey' }}>DEPROVISIONING</span>
            <div className="row">
              {this.state.deprovisionResponse.map((e, index) => {
                return (
                  <div key={index} >
                    <div className={`base-class ${e.provisionStatus.name=='COMPLETED'&& e.isDeprovision==true && e.deprovisionStatus.name ? 'engage-rect completed' : 'engage-rect'}`}>
                      <p className="bold-f">{e.name}</p>
                      <div className="light-f">  {e.provisionStatus.name=='COMPLETED'&& e.isDeprovision==false?<div> In progress </div>:null}</div>
                      <div className="light-f">  {e.provisionStatus.name=='COMPLETED'&& e.isDeprovision==true && e.deprovisionStatus.name=='GOODTORELIEVE'?<div> Good to relieve  </div>:null}</div>

                      {e.provisionStatus.name=='COMPLETED'&& e.isDeprovision==true && e.deprovisionStatus.name ?
                        <div className="completed-icon" >
                          <Icon type="check" />
                        </div>
                        : null}

                     {e.provisionStatus.name=='COMPLETED'&& e.isDeprovision==false ?
                        <div>
                          <div className="forprogress">
                            <div>
                              <img src={play}   onClick={() => this.getStatusList(e, "GOODTORELIEVE",'deprovision','DEPROVISION')}/>
                              <span className="" style={{ color: '#ffff' }} >start</span>
                            </div>
                          </div>
                        </div>
                        : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div> 
          </div>
         : null}
    </div>)
  }
  provisionDetail() {
    return (
      <div>
        {this.state.employeeDetail.employee!==undefined?
           <div>
            <span style={{ color: 'grey' }}>DOCUMENTATION</span>
            <div className="row">

              {this.state.documentList.map((e, index) => {
                return (
                  <div key={index}>
                  {e.isManditory!==false?
                    <div className="engage-rect">
                      <img className='doc-img'src={e.documentUrl!==undefined?e.documentUrl:null} />
                      <p className="light-f" style={{textAlign: 'center'}}>{e.folderName}</p>

                      {e.hasDoc==false?
                        <div>
                          <div className="forprogress">
                            <div>
                              <img src={upload}onClick={() =>  this.props.history.push('/home/updateEmployee/?ot=document&employee=' + this.state.employeeDetail.employee.employeeId)} />
                              <span className="" style={{ color: '#ffff' }} >upload</span>
                            </div>
                          </div>
                        </div>
                        :  <div>
                        <div className="forprogress">
                          <div>
                            <img src={tick}  />
                            <span className="" style={{ color: '#ffff' }}>Completed</span>
                          </div>
                        </div>
                      </div>}
                    </div>:null
                  }
                  </div>
                )
              })}
              <div onClick={() =>  this.props.history.push('/home/updateEmployee/?ot=document&employee=' + this.state.employeeDetail.employee.employeeId)} className="doc-rect" style={{ borderStyle: 'dashed' }}>
                <div className="addNew-doc">
                  <span>Add New</span>
                </div>
              </div>
             
            </div>
          </div>
        :null}


        {/* engagement */}

        {this.state.employeeDetail.engagementList !== undefined ?
          <div>
            <span style={{ color: 'grey', marginTop: 10 }}>{this.state.employeeDetail.engagementList.length != 0 ? 'EMPLOYEE ENGAGEMENT' : null}</span>
            <div className="row">
              {this.state.employeeDetail.engagementList.map((e, index) => {
                return (
                  <div key={index}>
                    <div className={`base-class ${e.status.name == 'COMPLETED' ? 'engage-rect completed' : 'engage-rect'}`}>
                      <p className="bold-f"> {e.name}</p>
                      <p className="light-f">  {e.status.name}</p>
                      {e.status.name == 'INPROGRESS' ?
                        <div>
                          <div className="forprogress">
                            <div>
                              <img src={pause} onClick={() => this.getStatusList(e, 'ONHOLD','engage','engagement')} />
                              <span className="" style={{ color: '#ffff' }}>On Hold</span>
                            </div>
                            <div>
                              <img src={tick} onClick={() =>  this.getStatusList(e, 'COMPLETED','engage','engagement')} />
                              <span className="" style={{ color: '#ffff' }}>Completed</span>
                            </div>
                          </div>
                        </div>
                        : null}

                      {e.status.name == 'ONHOLD' ?
                        <div className="forprogress">
                          <div>
                            <img src={play} onClick={() =>  this.getStatusList(e, 'INPROGRESS','engage','engagement')} />
                            <span className="" style={{ color: '#ffff' }}>Start</span>
                          </div>
                        </div>
                        : null}

                      {e.status.name == 'COMPLETED' ?
                        <div className="completed-icon" >
                          <Icon type="check" />
                        </div>
                        : null}
                    </div>

                  </div>)
              })}
            </div>
          </div> : null}
        {/* provision */}
        {this.state.employeeDetail.provisionList !== undefined?
          <div>
            <span style={{ color: 'grey' }}>{this.state.employeeDetail.provisionList.length !== 0 ? 'PROVISIONING' : null}</span>
            <div className="row">
              {this.state.employeeDetail.provisionList.map((e, index) => {
                return (
                  <div key={index} >
                    <div className={`base-class ${e.provisionStatus.name == 'COMPLETED' ? 'engage-rect completed' : 'engage-rect'}`}>
                      <p className="bold-f">{e.name}</p>
                      <p className="light-f">  {e.provisionStatus.name}</p>

                      {e.provisionStatus.name == 'COMPLETED' ?
                        <div className="completed-icon" >
                          <Icon type="check" />
                        </div>
                        : null}

                      {e.provisionStatus.name == 'INPROGRESS' ?
                        <div>
                          <div className="forprogress">
                            <div>
                              <img src={tick} onClick={() => this.getStatusList(e, 'COMPLETED','provision','Asset')} />
                              <span className="" style={{ color: '#ffff' }}>Completed</span>
                            </div>
                            <div>
                              <img src={pause} onClick={() => this.getStatusList(e, 'ONHOLD','provision','Asset')} />
                              <span className="" style={{ color: '#ffff' }}>OnHold</span>
                            </div>
                          </div>
                        </div>
                        : null}

                      {e.provisionStatus.name == 'ONHOLD' ?
                        <div>
                          <div className="forprogress">
                            <div>
                              <img src={play} onClick={() => this.getStatusList(e, 'INPROGRESS','provision','Asset')}  />
                              <span className="" style={{ color: '#ffff' }}>start</span>
                            </div>
                            <div>
                              <img src={tick} onClick={() => this.getStatusList(e, 'COMPLETED','provision','Asset')} />
                              <span className="" style={{ color: '#ffff' }}>Completed</span>
                            </div>
                          </div>
                        </div>
                        : null}
                    </div>
                  </div>
                )
              })}
            </div>
          </div> : null}

      </div>
    )
  }

  employeePercentageDetail() {
    return (<div>
      {this.state.employeeDetail.employee !== undefined ?
        <div className="employeecard">
          <div onClick={() => this.goDashboard()}>
            <Row type="flex" justify="center" >
              <div className="col-md-6">
                <Col span={3}>
                  {this.state.employeeDetail.employee.profileUrl !== null ?
                    <Avatar style={{ float: 'left', marginTop: 10, backgroundColor: "#e5eff9", verticalAlign: 'middle' }} src={this.state.employeeDetail.employee.profileUrl} size={65} ></Avatar> :
                    <Avatar style={{ float: 'left', marginTop: 10, backgroundColor: "grey" }} size={65} >{this.state.employeeDetail.employee.firstName.charAt(0).toUpperCase()}</Avatar>}
                </Col>
                <Col span={4}>Name
                <p>{this.state.employeeDetail.employee.firstName + ' ' + this.state.employeeDetail.employee.lastName}</p></Col>
                <Col span={9}>Email ID
                <p>{this.state.employeeDetail.employee.officialEmail}</p></Col>
                <Col span={4}>Employee ID
                <p>{this.state.employeeDetail.employee.code}</p></Col>
                <Col span={4}>DOJ<p>{this.state.employeeDetail.employee.dateOfJoin !== null ? this.state.employeeDetail.employee.dateOfJoin : '-'}</p></Col>

              </div>
              <div className="col-md-6">
                {this.state.isDeprovision !== true ? <Col span={8} style={{ paddingRight: 25 }}>Documentation
                <Progress percent={this.state.employeeDetail.documentationPercent} status="active" size="small" />
                </Col> : null}
                {this.state.isDeprovision !== true ? <Col span={8} style={{ paddingRight: 25 }}>Provisioning
              <Progress percent={this.state.employeeDetail.provisionPercent} status="active" /></Col> : null}
                {this.state.isDeprovision == true ? <Col span={9} style={{ paddingRight: 25 }}>Deprovisioning
              <Progress percent={this.state.employeeDetail.deprovisionPercent} status="active" /></Col> : null}
                {this.state.isDeprovision !== true ? <Col span={8} style={{ paddingRight: 25 }}>Training
              <Progress percent={this.state.employeeDetail.engagementPercent} status="active" /></Col> : null}
              </div>
            </Row>
          </div>
        </div> : null}
    </div>)
  }
  employeeDetail() {
    const path=this.state.employeeDetail.employee;
    return (
      <div>
        {this.state.employeeDetail.employee !== undefined ?
          <div>
            <span className="row">
              <span className="col-sm-5 employeeDetail-font">DOB:</span>
              <span className="col-sm-7 employeeDetail-font2">{path.dateOfBirth!=null?path.dateOfBirth:'-'}</span>
            </span>
            <span className="row">
              <span className="col-sm-5 employeeDetail-font">Contact Number:</span>
              <span className="col-sm-7 employeeDetail-font2">{path.personalContactNo!=null?path.personalContactNo:'-'}</span>
            </span>
            <span className="row">
              <span className="col-sm-5 employeeDetail-font">Gender:</span>
              <span className="col-sm-7 employeeDetail-font2">{this.state.employeeDetail.employee.gender}</span>
            </span>
            <span className="row">
              <span className="col-sm-5 employeeDetail-font">Current Address:</span>
             {path.presentAddress!==null? <span className="col-sm-7 employeeDetail-font2">{path.presentAddress!==null?this.state.employeeDetail.employee.presentAddress.doorNo:null},
              {path.presentAddress.city!=undefined?path.presentAddress.city:null},
              {path.presentAddress.state!=undefined?path.presentAddress.state:null},
              {path.presentAddress.pinCode!=undefined?path.presentAddress.pinCode:null}</span>
              :<span>-</span>}
            </span>
            <span className="row">
              <span className="col-sm-5 employeeDetail-font">Permenent Address:</span>
            {path.permanentAddress!==null? <span className="col-sm-7 employeeDetail-font2">{this.state.employeeDetail.employee.permanentAddress!=null},{this.state.employeeDetail.employee.permanentAddress.city},{this.state.employeeDetail.employee.permanentAddress.state},{this.state.employeeDetail.employee.permanentAddress.pinCode}</span>:'-'}
            </span>
            <span className="row">
              <span className="col-sm-5 employeeDetail-font">Status:</span>
              <span className="col-sm-7 employeeDetail-font2">{path.status.name!=null?path.status.name:'-'}</span>
            </span>
            <span className="row">
              <span className="col-sm-5 employeeDetail-font">Reporting Manager:</span>
              <span className="col-sm-7 employeeDetail-font2">{this.state.employeeDetail.employee.reportingManager !== null ? this.state.employeeDetail.employee.reportingManager.firstName : '-'}</span>
            </span>
          </div> : null}</div>
    )
  }
  render() {
    return (
      <Spin spinning={this.state.loading} delay={500}>
        <div>
          {this.employeePercentageDetail()}
          <div className="employeecontainer">
            <div className="row">
              <div className="col-sm-5" >
                {this.employeeDetail()}
              </div>
               <div className="col-sm-7 vl">
              {this.props.role.empPermission.isEdit==true?  
              <span onClick={() => this.editEmployee()} style={{ float: "right", color: '#D23B7D', fontFamily: 'Rubik', fontSize: 'regular' }}><Icon type="edit" style={{ padding: '3px' }} /> Edit Detail</span>
              :null}
                {this.state.isDeprovision==false?this.provisionDetail():null}
                {this.state.isDeprovision !== true && this.state.employeeDetail.employee!==undefined ? <Button type="default"  disabled={this.state.isAllProvisionCompleted==false} shape="round" onClick={() => this.startDeprovision()}> Start Deprovision </Button> : null}
                {this.state.isDeprovision==true?this.deprovisionDetail():null}
              </div>
            </div>
          </div>
        </div>
      </Spin>
    );
  }
}
const mapStateToProps = (state) => ({
  role: state
})
export default connect(mapStateToProps)(withRouter(EmployeeDetail));