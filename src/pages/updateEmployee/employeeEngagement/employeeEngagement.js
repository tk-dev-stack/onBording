
import React, { Component } from "react";
import { Button, Table, Pagination, Modal, Input } from 'antd'
import AddProgram from './addProgram'
import EditProgram from './editProgram'
import UrlConstant from "../../../Utils/UrlConstant";
import { GenericApiService } from "../../../Utils/GenericService";
import del from '../../../assets/del.svg'
import edit from '../../../assets/edit.svg'
import { EncryptDecryptSessionStorageService } from "../../../Utils/EncryptDecryptSessionStorageService";
import moment from 'moment'
import ColumnConstant from "../../../Utils/columnConstant";
import { commonService } from "../../../Utils/ConvertintoByteArray";
const { confirm } = Modal;
const { Search } = Input;
class EmployeeEngagement extends Component {
  constructor(props) {
    super(props)
    this.state = {
      addProgramPopUp: false,
      editProgramPopUp: false,
      start: 0,
      limit: 9,
      search: '',
      loading: true
    }
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.showTotal = this.showTotal.bind(this)

  }
  componentDidMount = () => {
    this.getEmpEngagement();
    this.setState({
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          if (selectedRows.length > 1) {

            this.setState({
              showDeleteMulPrograms: true,
              selectedProgramRows: selectedRows

            })

          } else {
            this.setState({
              showDeleteMulAssets: false
            })
          }
        },
        getCheckboxProps: record => ({
          disabled: record.name === 'Disabled User', // Column configuration not to be checked
          name: record.name,
        }),
      }
    })
  }
  addProgram = () => {
    this.setState({
      addProgramPopUp: true,

    })
  }
  addProgramCancel = () => {
    this.setState({
      addProgramPopUp: false,

    })
  }
  addProgramSave = () => {
    this.setState({
      addProgramPopUp: false,
      loading: true
    });
    this.getEmpEngagement();
    // this.props.changeNextTab("deprovision");
  }
  editProgram = (data) => {
    this.setState({
      editProgramPopUp: true,
      editobj: data
    })
  }

  editProgramCancel = () => {
    this.setState({
      editProgramPopUp: false,

    })
  }
  editProgramSave = () => {
    this.setState({
      editProgramPopUp: false,
      loading: true
    })
    this.getEmpEngagement();
  }

  searchKey = (key) => {
    this.state.search = key
    this.getEmpEngagement();
  }

  getEmpEngagement = () => {
    GenericApiService.Post(UrlConstant.engagementListByRange + '?start=' + this.state.start + '&limit=' + this.state.limit + '&organisationId=' + this.orgId + '&search=' + this.state.search + '&employeeId=' + this.props.tabObj.queryDetail.eid, '', false).then((response) => {
      if (response.status.success === 'Success') {
        response.data.map((obj, index) => {
          obj.key = index + Math.random();//key for rows;

          if (obj.employee.status.name === 'Under Notice Period' || obj.employee.status.name == 'Terminated') {
            obj.canAllowEmpDeprovision = true
          }
          var disableClick = response.data.every(e => e.employee.isDeprovisionStarted == true && obj.canAllowEmpDeprovision == true);
          this.setState({
            disableClick: disableClick
          })
          obj.startDate = moment(new Date(obj.startDate)).format("YYYY-MM-DD")
          obj.action = (
            <span className="action">
              {this.props.permission.empPermission.isEdit == true ?
                <a disabled={this.state.disableClick} onClick={this.editProgram.bind(this, response.data[index])}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14.005" height="14.005" viewBox="0 0 14.005 14.005"><path class="a" d="M0,0H14V14H0Z" /><path class="b" d="M9.454,6.513l.537.537L4.7,12.337H4.167V11.8L9.454,6.513M11.555,3a.584.584,0,0,0-.408.169L10.078,4.237l2.188,2.188,1.068-1.068a.581.581,0,0,0,0-.823L11.969,3.169A.573.573,0,0,0,11.555,3Zm-2.1,1.861L3,11.315V13.5H5.188L11.642,7.05,9.454,4.861Z" transform="translate(-1.249 -1.249)" /></svg>
                </a> : null}
              {this.props.permission.empPermission.isDelete == true ?
                <a disabled={this.state.disableClick} onClick={this.showDeleteConfirm.bind(this, [response.data[index]])}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path class="a" d="M0,0H14V14H0Z" /><path class="b" d="M11.423,6.5v5.836H6.752V6.5h4.671M10.547,3H7.627l-.584.584H5V4.751h8.174V3.584H11.131Zm2.044,2.334H5.584v7A1.171,1.171,0,0,0,6.752,13.5h4.671a1.171,1.171,0,0,0,1.168-1.167Z" transform="translate(-2.087 -1.252)" /></svg>
                </a>
                : null}
            </span>
          )
        });

        for (let date of response.data) {
          date.startDate = moment(date.startDate).format("DD-MM-YYYY");
          date.endDate = moment(date.endDate).format('DD-MM-YYYY')
        }
        this.setState({
          dataSource: response.data,
          totalresult: response.totalResult
        })
      }
      this.setState({ loading: false })
    });
  }
  onShowSizeChange(current, pageSize) {
    var start = (current - 1) * pageSize;
    this.setState({
      limit: pageSize,
      loading: true,
      start: start
    }, () => {
    })
    this.getEmpEngagement();
  }
  showTotal = (total, range) => {
    return `Items per page ${range[0]} - ${range[1]} of ${total} `
  }
  onpagechange = (pgno, limit) => {
    var start = (pgno - 1) * limit;
    this.setState({
      limit: limit,
      loading: true,
      start: start
    }, () => {
    })
    this.getEmpEngagement();
  }
  showDeleteConfirm = (selectedProgramRows) => {
    let that = this
    confirm({
      title: 'Are you sure to delete this user ?',
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'No',
      centered: true,
      onOk() {

        var url = UrlConstant.deleteEngagement;
        const fromdate = selectedProgramRows[0].startDate;
        selectedProgramRows[0].startDate = fromdate.split("-").reverse().join("-");
        const toDate = selectedProgramRows[0].endDate;
        selectedProgramRows[0].endDate = toDate.split("-").reverse().join("-");
        var payload = selectedProgramRows;

        GenericApiService.Post(url, payload, true).then(user => {

          if (user.status.success === 'Success') {
            that.setState({

              showDeleteMulPrograms: false

            })

            that.getEmpEngagement()

          }


        }
        )

      },
      onCancel() {

      },
    });
  }
  render() {
    return (
      <div>
        {this.state.addProgramPopUp === true ? (
          <AddProgram
            showHidePopup={this.state.addProgramPopUp}
            onOk={this.addProgramSave}
            onCancel={this.addProgramCancel}
            keyboard={false}
            employeeId={this.props.tabObj.queryDetail.eid}
          />
        ) : null}
        {this.state.editProgramPopUp === true ? (
          <EditProgram
            showHidePopup={this.state.editProgramPopUp}
            onOk={this.editProgramSave}
            onCancel={this.editProgramCancel}
            keyboard={false}
            editobj={this.state.editobj}
          />
        ) : null}
        <div className="row search-row">
          <div className="col-lg-12">
            <Search
              placeholder=" Search "
              onSearch={this.searchKey}
              onKeyPress={(e) => { commonService.removeFocus(this.refs, e) }}
              ref="input"
            />
            {this.props.permission.empPermission.isCreate === true ?
              <Button disabled={this.state.disableClick} className="btn-with-icon ml-4" type="primary" shape="round" icon="plus" onClick={this.addProgram} >Add Program</Button> : null}
            {this.state.showDeleteMulPrograms === true ? (
              <Button disabled={this.state.disableClick} className="btn-with-icon ml-4" type="primary" shape="round" icon="delete"

                onClick={this.showDeleteConfirm.bind(this, this.state.selectedProgramRows)}>Delete Programs</Button>
            ) : (null)}
          </div>
        </div>
        <div className="row table-row">
          <div className="col-lg-12">
            <div className="table-responsive">
              <Table rowSelection={this.state.rowSelection}
                loading={this.state.loading}
                columns={ColumnConstant.engagementColumn}
                dataSource={this.state.dataSource} pagination={false} />
            </div>
          </div>
        </div>
        <div className="row pagination-row">
          <div className="col-lg-12 text-right">
            <Pagination size="small"
              showSizeChanger
              total={this.state.totalresult}
              onShowSizeChange={this.onShowSizeChange}
              showTotal={this.showTotal}
              onChange={this.onpagechange} />
          </div>
        </div>
      </div>
    );
  }
}

export default EmployeeEngagement;
