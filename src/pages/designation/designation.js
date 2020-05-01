import React from "react";
import EditDesignation from '../designation/editDesignation';
import CreateDesignation from '../designation/createDesignation';
import { Button, Table, Input, Modal, Spin ,Pagination} from "antd";
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'
import del from '../../assets/del.svg'
import edit from '../../assets/edit.svg'
import UrlConstant from "../../Utils/UrlConstant";
import { GenericApiService } from "../../Utils/GenericService";
import ColumnConstant from "../../Utils/columnConstant";
import { commonService } from "../../Utils/ConvertintoByteArray";
const confirm = Modal.confirm;

const Search = Input.Search;
const columns = [
  {
    title: 'Designation',
    dataIndex: 'designation',
    key: 'designation',
    width: 150,
    render: text => <p>{text}</p>,
  },
  {
    title: 'Department',
    dataIndex: 'department',
    key: 'department',
    width: 150,
    render: text => <p>{text}</p>,
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    width: 150,
  },
  {
    title: 'Action',
    key: 'action',
    width: 150,
    dataIndex: 'action'

  },
];
class Designation extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      addDesignationPopup: false,
      editDesignationPopup: false,
      designationList: [],
      start: 0,
      limit: 10,
      search: '',
      selectedDesignationData: [],
      showDeleteMulDesig:false
    }
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.showTotal = this.showTotal.bind(this)
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this)
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
  }

  componentDidMount = () => {

    this.setState({
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
          if (selectedRows.length > 1) {

            this.setState({
              showDeleteMulDesig: true,
              selectedUserDesig: selectedRows

            })

          } else {
            this.setState({
              showDeleteMulDesig: false
            })
          }
        },
        getCheckboxProps: record => ({
          disabled: record.name === 'Disabled User', // Column configuration not to be checked
          name: record.name,
        }),
      }
    })
    this.getDesignation();

  }
  addDesignation = () => {
    this.setState({
      addDesignationPopup: true
    })
  }
  addDesignationSave = () => {
    this.setState({
      addDesignationPopup: false
    })
    this.getDesignation();

  }
  addDesignationCancel = () => {
    this.setState({
      addDesignationPopup: false
    })
  }


  editDesignation = (data) => {
    this.setState({
      editDesignationPopup: true,
      editobj: data
    })
  }
  editDesignationCancel = () => {
    this.setState({
      editDesignationPopup: false
    })
  }
  editDesignationSave = () => {
    this.setState({
      editDesignationPopup: false
    })
    this.getDesignation();
  }

  

  showDeleteConfirm = (selectedDesignationData) => {
    let that = this
    confirm({
      title: 'Are you sure to delete this designation ?',
      // content: 'Some descriptions',
      okText: 'Yes',
      okType: 'primary',
      cancelText: 'No',
      centered: true,
      onOk() {

        var url = UrlConstant.deleteDesignation;
        var payload = selectedDesignationData
        GenericApiService.Post(url, payload, true).then(designation => {
          that.setState({
            showDeleteMulDesig: false
          })
          that.getDesignation();

        }
        )

      },
      onCancel() {

      },
    });
  }

  getDesignation() {
    var url=UrlConstant.getDesignationListByRange + "?start=" + this.state.start + "&limit=" + this.state.limit + "&organisationId=" + this.orgId

    this.genericGetDesignationList(url)
  
  }
  searchDesig = (e) => {
    
    var searchValue = e.target.value
    var url =  UrlConstant.getDesignationListByRange + "?start=" + this.state.start + "&limit=" + this.state.limit + "&organisationId=" + this.orgId + "&search=" + searchValue

    this.genericGetDesignationList(url)
  }
  genericGetDesignationList=(url)=>{
    GenericApiService.Post(url, '', false).then((designations) => {
      if (designations.data !== '' && designations.data !== null) {


        designations.data.map((obj, index) => {
          obj.key = index + Math.random();//key for rows;
          obj.action = (
            <span className="action">
              {this.props.permission.orgPermission !== undefined ?
                this.props.permission.orgPermission.isEdit == true ?
                  <a onClick={this.editDesignation.bind(this, designations.data[index])}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14.005" height="14.005" viewBox="0 0 14.005 14.005"><path class="a" d="M0,0H14V14H0Z"/><path class="b" d="M9.454,6.513l.537.537L4.7,12.337H4.167V11.8L9.454,6.513M11.555,3a.584.584,0,0,0-.408.169L10.078,4.237l2.188,2.188,1.068-1.068a.581.581,0,0,0,0-.823L11.969,3.169A.573.573,0,0,0,11.555,3Zm-2.1,1.861L3,11.315V13.5H5.188L11.642,7.05,9.454,4.861Z" transform="translate(-1.249 -1.249)"/></svg>
                  </a>
                  : null
                : null}

              {this.props.permission.orgPermission !== undefined ?
                this.props.permission.orgPermission.isDelete == true ?
                <a onClick={this.showDeleteConfirm.bind(this, [designations.data[index]])}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><path class="a" d="M0,0H14V14H0Z"/><path class="b" d="M11.423,6.5v5.836H6.752V6.5h4.671M10.547,3H7.627l-.584.584H5V4.751h8.174V3.584H11.131Zm2.044,2.334H5.584v7A1.171,1.171,0,0,0,6.752,13.5h4.671a1.171,1.171,0,0,0,1.168-1.167Z" transform="translate(-2.087 -1.252)"/></svg>                  
                </a>
                  : null
                : null}
            </span>

          )
        });
        this.setState({
          totalPagesCount: designations.totalResult,
          designationList:designations.data,
          loading: false
        })
       

          

        
      }
      
    })

  }
  onShowSizeChange(current, pageSize) {
    var tempstart = (current - 1) * pageSize;
    this.setState({ loading: true })
    var url = UrlConstant.getDesignationListByRange + '?start=' + tempstart + '&limit=' + pageSize + '&organisationId=' + this.orgId
    this.genericGetDesignationList(url)
  }

  showTotal = (total, range) => {
    return `Items per page ${range[0]} - ${range[1]} of ${total} `
  }
  onpagechange = (pgno, limit) => {
    var start = (pgno - 1) * limit;
    this.setState({ loading: true })
    var url = UrlConstant.getDesignationListByRange + '?start=' + start + '&limit=' + limit + '&organisationId=' + this.orgId
    this.genericGetDesignationList(url)
  }

  render() {
    return (
      <div >
        {this.state.addDesignationPopup ? (
          <CreateDesignation
            showHidePopup={this.state.addDesignationPopup}
            onOk={this.addDesignationSave}
            onCancel={this.addDesignationCancel}
            keyboard={false}
          />
        ) : null}
        {this.state.editDesignationPopup ? (
          <EditDesignation
            showHidePopup={this.state.editDesignationPopup}
            designationData={this.state.selectedDesignationData}
            onOk={this.editDesignationSave}
            onCancel={this.editDesignationCancel}
            keyboard={false}
            editobj={this.state.editobj}
          />
        ) : null}
        <div className="row search-row">
          <div className="col-lg-6 col-md-4">
            <Search
              placeholder="Search"
              onChange={this.searchDesig}
              onKeyPress= {(e)=>{commonService.removeFocus(this.refs,e)}}
              ref="input"
            />
          </div>
          <div className="col-lg-6 col-md-8 text-right">

          {this.state.showDeleteMulDesig === true ? (
              <Button className="btn-with-icon mr-2 mr-lg-4" type="primary" shape="round" icon="delete"

                onClick={this.showDeleteConfirm.bind(this, this.state.selectedUserDesig)}>Delete Designations</Button>
            ) : (null)}
            {this.props.permission.orgPermission !== undefined ?
              this.props.permission.orgPermission.isCreate == true ?
                <Button className="btn-with-icon" type="primary" shape="round" icon="plus" onClick={this.addDesignation} >Create Designation</Button>
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
            columns={ColumnConstant.designationColumns} 
            dataSource={this.state.designationList ? this.state.designationList : <Spin/>} />
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
export default Designation;