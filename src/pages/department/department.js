import React from "react";
import EditDepartment from '../department/editDepartment';
import CreateDepartment from '../department/createDepartment';
import { GenericApiService } from "../../Utils/GenericService";
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'
import { Button, Table, Input, Modal,Pagination, Spin } from "antd";
import UrlConstant from "../../Utils/UrlConstant";
import del from '../../assets/del.svg'
import edit from '../../assets/edit.svg'
import ColumnConstant from "../../Utils/columnConstant";
import { commonService } from "../../Utils/ConvertintoByteArray";
const Search = Input.Search;
const confirm = Modal.confirm;


class Department extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addDepartmentPopup: false,
      editDepartmentPopup: false,
      departmentList: [],
      selectedDepartmentData: [],
      showDeleteMulDepmnt:false,
      loading:true,
      start:0,
      limit:10
    }
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.showTotal = this.showTotal.bind(this)
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this)
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
  }

  componentDidMount = () => {
    this.setState({
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          if (selectedRows.length > 1) {

            this.setState({
              showDeleteMulDepmnt: true,
              selectedUserDepmnt: selectedRows

            })

          } else {
            this.setState({
              showDeleteMulDepmnt: false
            })
          }
        },
        getCheckboxProps: record => ({
          disabled: record.name === 'Disabled User', // Column configuration not to be checked
          name: record.name,
        }),
      }
    })
    this.getDepartmentList()
  }

  getDepartmentList = () => {
    var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
    var url = UrlConstant.getDepartmentsList + '?start=' + this.state.start + '&limit=' + this.state.limit + '&organisationId=' + this.orgId
    var payload = ''

    this.genericGetDepartmentList(url, payload)

  }
  searchDepartment = (e) => {
    var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
    var searchValue = e.target.value
    var url =  UrlConstant.getDepartmentsList + '?start=' + this.state.start + '&limit=' + this.state.limit + '&organisationId=' + this.orgId + "&search=" + searchValue
    var payload = ''
    this.genericGetDepartmentList(url, payload)
  }

  showDeleteConfirm = (selectedDepartmentData) => {
    let that = this
    confirm({
      title: 'Are you sure to delete this department ?',
      content: selectedDepartmentData.name,
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'No',
      centered: true,
      onOk() {
        var url = UrlConstant.deleteDepartment
        var payload = selectedDepartmentData
        GenericApiService.Post(url, payload, true).then(department => {

          if (department.status.success === 'Success') {
            that.setState({
              showDeleteMulDepmnt: false
            })

            that.getDepartmentList()

          }
        }
        )

      },
      onCancel() {

      },
    });
  }

  genericGetDepartmentList = (url, payload) => {

    GenericApiService.Post(url, payload).then((departments) => {
      if (departments.data !== '' && departments.data !== null) {


        departments.data.map((obj, index) => {
          obj.key = index + Math.random();//key for rows;
          obj.action = (
            <span className="action">
              {this.props.permission.orgPermission !== undefined ?
                this.props.permission.orgPermission.isEdit == true ?
                  <a onClick={this.editDepartment.bind(this, departments.data[index])}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14.005" height="14.005" viewBox="0 0 14.005 14.005"><path class="a" d="M0,0H14V14H0Z"/><path class="b" d="M9.454,6.513l.537.537L4.7,12.337H4.167V11.8L9.454,6.513M11.555,3a.584.584,0,0,0-.408.169L10.078,4.237l2.188,2.188,1.068-1.068a.581.581,0,0,0,0-.823L11.969,3.169A.573.573,0,0,0,11.555,3Zm-2.1,1.861L3,11.315V13.5H5.188L11.642,7.05,9.454,4.861Z" transform="translate(-1.249 -1.249)"/></svg>                    
                  </a>
                  : null
                : null}
              {this.props.permission.orgPermission !== undefined ?
                this.props.permission.orgPermission.isDelete == true ?
                <a onClick={this.showDeleteConfirm.bind(this, [departments.data[index]])}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path class="a" d="M0,0H14V14H0Z"/><path class="b" d="M11.423,6.5v5.836H6.752V6.5h4.671M10.547,3H7.627l-.584.584H5V4.751h8.174V3.584H11.131Zm2.044,2.334H5.584v7A1.171,1.171,0,0,0,6.752,13.5h4.671a1.171,1.171,0,0,0,1.168-1.167Z" transform="translate(-2.087 -1.252)"/></svg>                  
                  </a>
                  : null
                : null}

            </span>

          )

        });

        this.setState({
          totalPagesCount: departments.totalResult,
          departmentList: departments.data,
          loading: false
        })



      }



    })

  }
  onShowSizeChange(current, pageSize) {
    var tempstart = (current - 1) * pageSize;
    this.setState({ loading: true })
    var url = UrlConstant.getDepartmentsList + '?start=' + tempstart + '&limit=' + pageSize + '&organisationId=' + this.orgId
    this.genericGetDepartmentList(url)
  }

  showTotal = (total, range) => {
    return `Items per page ${range[0]} - ${range[1]} of ${total} `
  }
  onpagechange = (pgno, limit) => {
    var start = (pgno - 1) * limit;
    this.setState({ loading: true })
    var url = UrlConstant.getDepartmentsList + '?start=' + start + '&limit=' + limit + '&organisationId=' + this.orgId
    this.genericGetDepartmentList(url)
  }
  addDepartment = () => {

    this.setState({
      addDepartmentPopup: true
    })
  }
  addDepartmentSave = () => {
    this.setState({
      addDepartmentPopup: false
    })
    this.getDepartmentList()
  }
  addDepartmentCancel = () => {
    this.setState({
      addDepartmentPopup: false
    })
  }
  editDepartmentSave = () => {
    this.setState({
      editDepartmentPopup: false
    })
    this.getDepartmentList()
  }

  editDepartment = (departmentdata) => {
    this.setState({
      editDepartmentPopup: true,
      selectedDepartmentData: departmentdata
    })
    this.getDepartmentList()
  }
  editDepartmentCancel = () => {
    this.setState({
      editDepartmentPopup: false
    })
  }

  
  render() {
    return (
      <div>
        {this.state.addDepartmentPopup ? (
          <CreateDepartment
            showHidePopup={this.state.addDepartmentPopup}
            onOk={this.addDepartmentSave}
            onCancel={this.addDepartmentCancel}
            keyboard={false}
          />
        ) : null}
        {this.state.editDepartmentPopup ? (
          <EditDepartment
            showHidePopup={this.state.editDepartmentPopup}
            departmentdata={this.state.selectedDepartmentData}
            onOk={this.editDepartmentSave}
            onCancel={this.editDepartmentCancel}
            keyboard={false}
          />
        ) : null}
        <div className="row search-row">
          <div className="col-lg-6 col-md-4">
            <Search
              placeholder="Search"
              onChange={this.searchDepartment}
              onKeyPress= {(e)=>{commonService.removeFocus(this.refs,e)}}
              ref="input"
            />
          </div>
          <div className="col-lg-6 col-md-8 text-right">
          {this.state.showDeleteMulDepmnt === true ? (
              <Button className="btn-with-icon mr-2 mr-lg-4" type="primary" shape="round" icon="delete"

                onClick={this.showDeleteConfirm.bind(this, this.state.selectedUserDepmnt)}>Delete Departments</Button>
            ) : (null)}
            {this.props.permission.orgPermission !== undefined ?
              this.props.permission.orgPermission.isCreate === true ?
              <Button className="btn-with-icon" type="primary" shape="round" icon="plus" onClick={this.addDepartment}>Create Department</Button>
                : null
              : null}
              
          </div>

      </div>



          <div className="row table-row">
            <div className="col-lg-12">
            <div className="table-responsive">
              <Table  {...this.state}
              pagination={false}
                rowSelection={this.state.rowSelection}
                columns={ColumnConstant.departmentColumns}
                dataSource={this.state.departmentList ? this.state.departmentList : <Spin/>} />
                </div>
          </div>
          </div>
          <div className="row pagination-row">
            <div className="col-lg-12 text-right">
            <Pagination size="small"
            
                    total={this.state.totalPagesCount} showSizeChanger
                    onShowSizeChange={this.onShowSizeChange}
                    showTotal={this.showTotal}
                    onChange={this.onpagechange} />
              </div>
              </div>
     
      </div>
    );
  }
}
export default Department;