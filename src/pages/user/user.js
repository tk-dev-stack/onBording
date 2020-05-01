import React from "react";
import { Button, Table, Input, Modal, Pagination, Spin } from "antd";
import CreateUser from '../user/createUser';
import EditUser from '../user/editUser';
import ColumnConstant from "../../Utils/columnConstant";
import { GenericApiService } from "../../Utils/GenericService";
import UrlConstant from "../../Utils/UrlConstant";
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'
import del from '../../assets/del.svg'
import edit from '../../assets/edit.svg'
import { commonService } from "../../Utils/ConvertintoByteArray";

const Search = Input.Search;
const confirm = Modal.confirm;

class User extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addUserPopup: false,
      editUserPopup: false,
      userList: [],
      selectedUserData: [],
      start: 0,
      limit: 10,
      search: '',
      loading: true
    }
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')

    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.showTotal = this.showTotal.bind(this)
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this)
  }

  componentDidMount = () => {
    this.setState({
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          if (selectedRows.length > 1) {

            this.setState({
              showDeleteMulUser: true,
              selectedUserRows: selectedRows

            })

          } else {
            this.setState({
              showDeleteMulUser: false
            })
          }
        },
        getCheckboxProps: record => ({
          disabled: record.name === 'Disabled User', // Column configuration not to be checked
          name: record.name,
        }),
      }
    })
    this.getUserList()
  }

  searchUser = (e) => {
    var searchValue = e.target.value;

    var url = UrlConstant.getUserList +
    "?start=" + this.state.start +
    "&limit=" + this.state.limit +
    "&organisationId=" + this.orgId +
    "&search=" + searchValue;
  this.genericGetUsersList(url)

  }

  getUserList = () => {
    var url = UrlConstant.getUserList +
      "?start=" + this.state.start +
      "&limit=" + this.state.limit +
      "&organisationId=" + this.orgId +
      "&search=" + this.state.search;
    this.genericGetUsersList(url)



  }
  genericGetUsersList = (url) => {
    GenericApiService.Post(url, '', false).then((users) => {
      if (users.data !== '' && users.data !== null) {


        users.data.map((obj, index) => {
          obj.key = index + Math.random();//key for rows;
          obj.action = (
            <span className="action">

              {this.props.permission.userPermission !== undefined ?
                this.props.permission.userPermission.isEdit == true ?
                  <a onClick={this.editUser.bind(this, users.data[index])}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14.005" height="14.005" viewBox="0 0 14.005 14.005"><path class="a" d="M0,0H14V14H0Z" /><path class="b" d="M9.454,6.513l.537.537L4.7,12.337H4.167V11.8L9.454,6.513M11.555,3a.584.584,0,0,0-.408.169L10.078,4.237l2.188,2.188,1.068-1.068a.581.581,0,0,0,0-.823L11.969,3.169A.573.573,0,0,0,11.555,3Zm-2.1,1.861L3,11.315V13.5H5.188L11.642,7.05,9.454,4.861Z" transform="translate(-1.249 -1.249)" /></svg>
                  </a>
                  : null
                : null}

              {this.props.permission.userPermission !== undefined ?
                this.props.permission.userPermission.isDelete == true ?
                  <a onClick={this.showDeleteConfirm.bind(this, [users.data[index]])}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path class="a" d="M0,0H14V14H0Z" /><path class="b" d="M11.423,6.5v5.836H6.752V6.5h4.671M10.547,3H7.627l-.584.584H5V4.751h8.174V3.584H11.131Zm2.044,2.334H5.584v7A1.171,1.171,0,0,0,6.752,13.5h4.671a1.171,1.171,0,0,0,1.168-1.167Z" transform="translate(-2.087 -1.252)" /></svg>
                  </a>
                  : null
                : null}

            </span>
          )
        });

        this.setState({
          totalPagesCount: users.totalResult,
          loading: false,
          userList: users.data
        })




      }



    })

  }

  showDeleteConfirm = (selectedUserData) => {
    let that = this
    confirm({
      title: 'Are you sure to delete this user ?',
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'No',
      centered: true,
      onOk() {

        var url = UrlConstant.deleteUser
        var payload = selectedUserData
        GenericApiService.Post(url, payload, true).then(user => {

          if (user.status.success === 'Success') {
            that.setState({

              showDeleteMulUser: false

            })

            that.getUserList()

          }
        }
        )
      },
      onCancel() {

      },
    });
  }
  onShowSizeChange(current, pageSize) {
    var tempstart = (current - 1) * pageSize;
    this.setState({ loading: true })
    var url = UrlConstant.getUserList + '?start=' + tempstart + '&limit=' + pageSize + '&organisationId=' + this.orgId
    this.genericGetUsersList(url)
  }

  showTotal = (total, range) => {
    return `Items per page ${range[0]} - ${range[1]} of ${total} `
  }
  onpagechange = (pgno, limit) => {
    var start = (pgno - 1) * limit;
    this.setState({ loading: true })
    var url = UrlConstant.getUserList + '?start=' + start + '&limit=' + limit + '&organisationId=' + this.orgId
    this.genericGetUsersList(url)
  }

  addUser = () => {
    this.setState({
      addUserPopup: true
    })
  }
  addUserSave = () => {
    this.setState({
      addUserPopup: false
    })
    this.getUserList()
  }
  addUserCancel = () => {
    this.setState({
      addUserPopup: false
    })
  }


  editUser = (userdata) => {

    this.setState({
      editUserPopup: true,
      selectedUserData: userdata

    })
    this.getUserList()
  }
  editUserSave = () => {
    this.setState({
      editUserPopup: false
    })
    this.getUserList()
  }
  editUserCancel = () => {
    this.setState({
      editUserPopup: false
    })
  }
  render() {
    return (
      <div>
        {this.state.addUserPopup ? (
          <CreateUser
            showHidePopup={this.state.addUserPopup}
            onOk={this.addUserSave}
            onCancel={this.addUserCancel}
            keyboard={false}
          />
        ) : null}
        {this.state.editUserPopup ? (
          <EditUser
            showHidePopup={this.state.editUserPopup}
            userdata={this.state.selectedUserData}
            onOk={this.editUserSave}
            onCancel={this.editUserCancel}
            keyboard={false}
          />
        ) : null}

        <div className="row search-row">
          <div className="col-lg-6 col-md-6">
            <Search
              placeholder="Search"
              onChange={this.searchUser}
              onKeyPress={(e) => { commonService.removeFocus(this.refs, e) }}
              ref="input"
            />
          </div>

          <div className="col-lg-6 col-md-6 text-right">
            {this.state.showDeleteMulUser === true ? (
              <Button className="btn-with-icon mr-4" type="primary" shape="round" icon="delete"

                onClick={this.showDeleteConfirm.bind(this, this.state.selectedUserRows)}>Delete Users</Button>
            ) : (null)}
            {this.props.permission.userPermission !== undefined ?
              this.props.permission.userPermission.isCreate == true ?
                <Button className="btn-with-icon" type="primary" shape="round" icon="plus"
                  onClick={this.addUser} >Create User</Button>
                : null
              : null}
          </div>
        </div>
        <div className="row table-row">
          <div className="col-lg-12">
            <div className="table-responsive">
              <Table {...this.state}
                columns={ColumnConstant.userListcolumns}
                rowSelection={this.state.rowSelection}
                dataSource={this.state.userList ? this.state.userList : <Spin style={{}} />}

                pagination={false
                  //   {
                  //   total: this.state.totalPagesCount, showSizeChanger: true, showQuickJumper: true
                  // }
                } />
            </div>
          </div>
        </div>
        <div className="row pagination-row">
          <div className="col-lg-12 text-right">
            <Pagination size="small"
              showSizeChanger
              total={this.state.totalPagesCount}
              onShowSizeChange={this.onShowSizeChange}
              showTotal={this.showTotal}
              onChange={this.onpagechange} />
          </div>
        </div>
      </div>
    );
  }
}
export default User;
