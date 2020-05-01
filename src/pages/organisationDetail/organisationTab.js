import React from "react";
import { Spin,Tabs ,Icon, Button,Image} from "antd";
import Designation from "../designation/designation";
import Department from "../department/department";
import {Link,withRouter} from 'react-router-dom';
import { EncryptDecryptSessionStorageService } from "../../Utils/EncryptDecryptSessionStorageService";
import UrlConstant from "../../Utils/UrlConstant";
import { GenericApiService } from "../../Utils/GenericService";
import EmployeeBulkUpload from './employeeBulkUpload';
import edit from '../../assets/edit.svg';

const { TabPane } = Tabs;


class OrganisationDetail  extends React.Component {
constructor(props){
  super(props);
  this.state={
    orgDetail:{},
    EmployeeBulkUploadPopUp:false

  }
  this.orgName=EncryptDecryptSessionStorageService.getSessionStorage('orgName');
  this.organisationDetail();
}
organisationDetail(){

  var orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
  var url = UrlConstant.getOrgById + 'organisationId=' + orgId
  var payload = ''
  GenericApiService.Post(url, payload).then((response) => {
    if (response.data !== '' && response.data !== null) {
      this.setState({
        orgDetail: response.data
      })
    }

  })
}
onBulkUpload=()=>{
  this.setState({
    EmployeeBulkUploadPopUp:true
  })
}
addBulkUploadOk=()=>{
  this.setState({
    EmployeeBulkUploadPopUp:false
  })
}
addBulkUploadCancel=()=>{
  this.setState({
    EmployeeBulkUploadPopUp:false
  })
}
goback = () => {
  this.props.history.goBack();
}
  render() {
    return (
      <div>
        {this.state.EmployeeBulkUploadPopUp ? (
            <EmployeeBulkUpload
              showHidePopup={this.state.EmployeeBulkUploadPopUp}
              data={this.state.dataDoc}
              onOk={this.addBulkUploadOk}
              
              onCancel={this.addBulkUploadCancel}
              keyboard={false}
            />
          ) : null}
      <Spin spinning={this.state.orgDetail==null?true:false} delay={500}>
      <div className="main-content">   
      <div className="row">
        <div className="col-md-6">
            <h4>        
            {this.props.location.pathname!== "/home/dashboard"?      
            <Icon   type="arrow-left" onClick={this.goback}/>:null}
            {this.state.orgDetail!==null? this.state.orgDetail.name:null}
          {this.props.permission!==undefined?this.props.permission.orgPermission.isEdit==true? 
          <Link to="/home/edit/organisation">        
             <img style ={{paddingLeft:15}} src={edit}></img>
          </Link>:null :null}
          </h4> 
        </div>
        <div className="col-md-6 text-center text-sm-right mb-3 mb-md-0">
          <Button type="primary" htmlType="submit" shape="round" className='ant-btn-secondary btn-with-icon' icon="plus" onClick={this.onBulkUpload}>
              Bulk Upload Employees    
          </Button>
        </div>
      </div>     
       
      

      <div className="card user-card">
          {this.props.permission!==undefined?this.props.permission.orgPermission.isView==true?
          <Tabs defaultActiveKey="1" >
              <TabPane tab="Departments" key="1">
              <Department permission={this.props.permission}/>
              </TabPane>
              <TabPane tab="Designation" key="2">
              <Designation permission={this.props.permission}/>
              </TabPane>
          </Tabs>:null :null}
      </div>
      </div></Spin>
      </div>
  );

  }
}

export default withRouter(OrganisationDetail);

