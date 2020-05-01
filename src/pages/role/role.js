import React from "react";
import { Button, Table, Input, Modal, notification, Pagination, Spin } from "antd";
import CreateRole from '../role/createRole';
import EditRole from '../role/editRole';
import { GenericApiService } from "../../Utils/GenericService";
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'
import ColumnConstant from "../../Utils/columnConstant";
import UrlConstant from "../../Utils/UrlConstant";
import { Link } from 'react-router-dom'
import del from '../../assets/del.svg'
import edit from '../../assets/edit.svg'
import { commonService } from "../../Utils/ConvertintoByteArray";
const confirm = Modal.confirm;

const Search = Input.Search;
class Role extends React.Component {

  constructor(props) {
    super(props)
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
    this.state = {
      addRolePopup: false,
      editRolePopup: false,
      roleList: [],
      loading: true,
      selectedRoleData: [],
      start: 0,
      limit: 9,
      search: '',
      showDeleteMulRole: false
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
          if (selectedRows.length > 1) {

            this.setState({
              showDeleteMulRole: true,
              selectedRoleRows: selectedRows

            })

          } else {
            this.setState({
              showDeleteMulRole: false
            })
          }
        },
        getCheckboxProps: record => ({
          disabled: record.name === 'Disabled User', // Column configuration not to be checked
          name: record.name,
        }),
      }
    })
    this.getRoleList()
  }
  searchRole = (e) => {
    var searchValue = e.target.value

    var url = UrlConstant.getRoleList +
      "?start=" + this.state.start +
      "&limit=" + this.state.limit +
      "&organisationId=" + this.orgId +
      "&search=" + searchValue;
    this.genericGetRolesList(url);
  }


  showDeleteConfirm = (selectedRoleData) => {
    let that = this
    confirm({
      title: 'Are you sure to delete this role ?',
      // content: 'Some descriptions',
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'No',
      centered: true,
      onOk() {

        var url = UrlConstant.deleteRole
        var payload = selectedRoleData
        GenericApiService.Post(url, payload, true).then(role => {
          if (role.status.success === 'Success') {
            that.setState({
              showDeleteMulRole: false
            })
            that.getRoleList()
          }

        }
        )

      },
      onCancel() {

      },
    });
  }
  getRoleList = () => {

    var url = UrlConstant.getRoleList + "?start=" + this.state.start + "&limit=" + this.state.limit + "&organisationId=" + this.orgId + "&search=" + this.state.search
    this.genericGetRolesList(url);
  }
  genericGetRolesList = (url) => {
    GenericApiService.GetAll(url, '').then((roles) => {
      if (roles.data !== '' && roles.data !== null) {

        roles.data.map((obj, index) => {
          obj.key = index + Math.random();//key for rows;
          obj.action = (

            <span className="action">
              {this.props.permission.userPermission !== undefined ?
                this.props.permission.userPermission.isEdit == true ?
                  <a onClick={this.editRole.bind(this, roles.data[index])}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14.005" height="14.005" viewBox="0 0 14.005 14.005"><path class="a" d="M0,0H14V14H0Z" /><path class="b" d="M9.454,6.513l.537.537L4.7,12.337H4.167V11.8L9.454,6.513M11.555,3a.584.584,0,0,0-.408.169L10.078,4.237l2.188,2.188,1.068-1.068a.581.581,0,0,0,0-.823L11.969,3.169A.573.573,0,0,0,11.555,3Zm-2.1,1.861L3,11.315V13.5H5.188L11.642,7.05,9.454,4.861Z" transform="translate(-1.249 -1.249)" /></svg>
                  </a>
                  : null
                : null}

              {this.props.permission.userPermission !== undefined ?
                this.props.permission.userPermission.isDelete === true ?
                  <a onClick={this.showDeleteConfirm.bind(this, [roles.data[index]])} >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path class="a" d="M0,0H14V14H0Z" /><path class="b" d="M11.423,6.5v5.836H6.752V6.5h4.671M10.547,3H7.627l-.584.584H5V4.751h8.174V3.584H11.131Zm2.044,2.334H5.584v7A1.171,1.171,0,0,0,6.752,13.5h4.671a1.171,1.171,0,0,0,1.168-1.167Z" transform="translate(-2.087 -1.252)" /></svg>
                  </a>
                  : null
                : null}

            </span>

          )
        });

        this.setState({
          totalPagesCount: roles.totalResult,
          loading: false,
          roleList: roles.data
        })




      }



    })

  }
  onShowSizeChange(current, pageSize) {
    var tempstart = (current - 1) * pageSize;
    this.setState({ loading: true })
    var url = UrlConstant.getRoleList + '?start=' + tempstart + '&limit=' + pageSize + '&organisationId=' + this.orgId
    this.genericGetRolesList(url)
  }

  showTotal = (total, range) => {
    return `Items per page ${range[0]} - ${range[1]} of ${total} `
  }
  onpagechange = (pgno, limit) => {
    var start = (pgno - 1) * limit;
    this.setState({ loading: true })
    var url = UrlConstant.getRoleList + '?start=' + start + '&limit=' + limit + '&organisationId=' + this.orgId
    this.genericGetRolesList(url)
  }

  addRole = () => {
    this.setState({
      addRolePopup: true
    })

  }
  addRoleSave = () => {
    this.setState({
      addRolePopup: false
    })
    this.getRoleList()

  }
  addRoleCancel = () => {
    this.setState({
      addRolePopup: false
    })
  }
  editRole = (roledata) => {

    this.setState({

      editRolePopup: true,
      selectedRoleData: roledata
    })

  }
  editRoleSave = () => {
    this.setState({
      editRolePopup: false
    })
    this.getRoleList()
  }
  editRoleCancel = () => {
    this.setState({
      editRolePopup: false
    })
  }
  render() {
    return (

      <div>
        {this.state.addRolePopup ? (
          <CreateRole
            showHidePopup={this.state.addRolePopup}
            onOk={this.addRoleSave}
            onCancel={this.addRoleCancel}
            keyboard={false}
          />
        ) : null}
        {this.state.editRolePopup ? (
          <EditRole
            showHidePopup={this.state.editRolePopup}
            roleData={this.state.selectedRoleData}
            onOk={this.editRoleSave}
            onCancel={this.editRoleCancel}
            keyboard={false}
          />
        ) : null}
        <div className="row search-row">
          <div className="col-lg-6 col-md-6">
            <Search
              placeholder="Search"
              onKeyPress={(e) => { commonService.removeFocus(this.refs, e) }}
              ref="input"
              onChange={this.searchRole}
            />
          </div>
          <div className="col-lg-6 col-md-6 text-right">
            {this.state.showDeleteMulRole === true ? (
              <Button className="btn-with-icon mr-4" type="primary" shape="round" icon="delete"

                onClick={this.showDeleteConfirm.bind(this, this.state.selectedRoleRows)}>Delete Roles</Button>
            ) : (null)}
            {this.props.permission.userPermission !== undefined ?
              this.props.permission.userPermission.isCreate == true ?
                <Button className="btn-with-icon" type="primary" shape="round" icon="plus" onClick={this.addRole}>Create Role</Button>
                : null
              : null}
          </div>
        </div>
        <div className="row table-row">
          <div className="col-lg-12">
            <div className="table-responsive">
              <Table {...this.state}
                pagination={false}
                rowSelection={this.state.rowSelection}
                columns={ColumnConstant.roleListColumn}
                dataSource={this.state.roleList ? this.state.roleList : <Spin style={{}} />} />
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
export default Role;