import React, { Component } from "react";
import { Button, Table, Input, Modal, Pagination, Spin } from "antd";
import { Link } from "react-router-dom";
import { GenericApiService } from "../../../Utils/GenericService";
import UrlConstant from "../../../Utils/UrlConstant";
import { EncryptDecryptSessionStorageService } from "../../../Utils/EncryptDecryptSessionStorageService";
import del from "../../../assets/del.svg";
import edit from "../../../assets/edit.svg";
import AddAssets from "./addAssets";
import EditAssets from "./editAssets";
import ColumnConstant from "../../../Utils/columnConstant";
import { commonService } from "../../../Utils/ConvertintoByteArray";
import moment from "moment";

const confirm = Modal.confirm;
const Search = Input.Search;
class Provision extends Component {
  constructor(props) {
    super(props);
    this.state = {
      provisionList: [],
      addAsstePopup: false,
      editAsstePopup: false,
      start: 0,
      limit: 10,
      rowSelection: {},
      showDeleteMulAssets: false,
      loading: true,
      button_loader: false,
      disableButton: false,
      disableStartProvision: false
    };
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage("orgId");
    this.userId = EncryptDecryptSessionStorageService.getSessionStorage(
      "userId"
    );
    this.empId = this.props.tabObj.queryDetail.eid;
    this.onShowSizeChange = this.onShowSizeChange.bind(this);
    this.showTotal = this.showTotal.bind(this);
    this.showDeleteConfirm = this.showDeleteConfirm.bind(this);
  }

  componentDidMount = () => {
    this.setState({
      rowSelection: {
        onChange: (selectedRowKeys, selectedRows) => {
          if (selectedRows.length > 1) {
            this.setState({
              showDeleteMulAssets: true,
              selectedAssetRows: selectedRows
            });
          } else {
            this.setState({
              showDeleteMulAssets: false
            });
          }
        },
        getCheckboxProps: record => ({
          disabled: record.name === "Disabled User", // Column configuration not to be checked
          name: record.name
        })
      }
    });
    this.getProvisionList();
  };
  getProvisionList = () => {
    var url =
      UrlConstant.getAssetList +
      "start=" +
      this.state.start +
      "&limit=" +
      this.state.limit +
      "&organisationId=" +
      this.orgId +
      "&employeeId=" +
      this.empId;
    this.genericGetProvisionList(url);
  };

  onSearch = e => {
    var searchValue = e.target.value;
    var url =
      UrlConstant.getAssetList +
      "start=" +
      this.state.start +
      "&limit=" +
      this.state.limit +
      "&organisationId=" +
      this.orgId +
      "&employeeId=" +
      this.empId +
      "&search=" +
      searchValue;
    this.genericGetProvisionList(url);
  };

  onShowSizeChange(current, pageSize) {
    var tempstart = (current - 1) * pageSize;
    this.setState({ loading: true });
    var url =
      UrlConstant.getAssetList +
      "start=" +
      tempstart +
      "&limit=" +
      pageSize +
      "&organisationId=" +
      this.orgId +
      "&employeeId=" +
      this.empId;
    this.genericGetProvisionList(url);
  }

  showTotal = (total, range) => {
    return `Items per page ${range[0]} - ${range[1]} of ${total} `;
  };
  onpagechange = (pgno, limit) => {
    var start = (pgno - 1) * limit;
    this.setState({ loading: true });
    var url =
      UrlConstant.getAssetList +
      "start=" +
      start +
      "&limit=" +
      limit +
      "&organisationId=" +
      this.orgId +
      "&employeeId=" +
      this.empId;
    this.genericGetProvisionList(url);
  };

  genericGetProvisionList = url => {
    GenericApiService.Post(url, "").then(response => {
      //   check Provision status is list is empty to enable start provisioning
      if (response.data.length === 0) {
        this.setState({
          disableStartProvision: true
        });
      }
      if (response.status.success === "Success" && response.data.length > 0) {
        //// check Provision status is pending or not to enable start provisioning//
        var newProvisionList = response.data;

        for (let provision of newProvisionList) {
          if (
            provision.provisionStatus &&
            provision.provisionStatus.name === "Pending"
          ) {
            this.setState({
              disableStartProvision: false,
              button_loader: false
            });

            break;
          } else {
            this.setState({
              disableStartProvision: true,
              button_loader: false
            });
          }
        }
        ////
        response.data.map((obj, index) => {
          obj.key = index + Math.random(); //key for rows;
          //setting isdeprovision if its null at inital
          if (obj.employee.isDeprovisionStarted == null) {
            obj.employee.isDeprovisionStarted = false;
          }

          //checking employee status of employee (notice or terminated) to  start deprovision
          if (
            obj.employee.status.name == "Under Notice Period" ||
            obj.employee.status.name == "Terminated"
          ) {
            obj.empStatusToDeprovision = true;
          }

          //disble button functionality
          if (obj.provisionStatus) {
            if (
              obj.provisionStatus.name === "Completed" &&
              obj.employee.isDeprovisionStarted === true &&
              obj.empStatusToDeprovision === true
            ) {
              obj.disableButton = true;
            }
          } else {
            obj.disableButton = false;
          }
        });

        for(let date of newProvisionList){
          date.assignedDate =moment(date.assignedDate).format("DD-MM-YYYY");
        }

        this.setState({
          provisionList: response.data,
          totalPagesCount: response.totalResult,
          loading: false
        });

        var EaceRowDisableFuction = response.data.every(e => e.disableButton);
        this.setState({
          disableButton: EaceRowDisableFuction
        });

        //edit and delete in list
        this.state.provisionList.map((obj, index) => {
          obj.action = (
            <span className="action">
              <a
                disabled={this.state.disableButton}
                onClick={this.editAsset.bind(this, response.data[index])}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14.005"
                  height="14.005"
                  viewBox="0 0 14.005 14.005"
                >
                  <path class="a" d="M0,0H14V14H0Z" />
                  <path
                    class="b"
                    d="M9.454,6.513l.537.537L4.7,12.337H4.167V11.8L9.454,6.513M11.555,3a.584.584,0,0,0-.408.169L10.078,4.237l2.188,2.188,1.068-1.068a.581.581,0,0,0,0-.823L11.969,3.169A.573.573,0,0,0,11.555,3Zm-2.1,1.861L3,11.315V13.5H5.188L11.642,7.05,9.454,4.861Z"
                    transform="translate(-1.249 -1.249)"
                  />
                </svg>
              </a>
              <a
                disabled={this.state.disableButton}
                onClick={this.showDeleteConfirm.bind(this, [
                  response.data[index]
                ])}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                >
                  <path class="a" d="M0,0H14V14H0Z" />
                  <path
                    class="b"
                    d="M11.423,6.5v5.836H6.752V6.5h4.671M10.547,3H7.627l-.584.584H5V4.751h8.174V3.584H11.131Zm2.044,2.334H5.584v7A1.171,1.171,0,0,0,6.752,13.5h4.671a1.171,1.171,0,0,0,1.168-1.167Z"
                    transform="translate(-2.087 -1.252)"
                  />
                </svg>
              </a>
            </span>
          );
        });
      }
      this.setState({
        loading: false,
        provisionList: response.data,

        totalPagesCount: response.totalResult
      });
    });
  };
  showDeleteConfirm = selectedProvisionData => {
    let that = this;
    confirm({
      title: "Are you sure to delete this asset ?",
      okText: "Yes",
      okType: "primary",
      cancelText: "No",
      content: selectedProvisionData.name,
      centered: true,
      onOk() {
        var url = UrlConstant.deleteAsset;
        const date = selectedProvisionData[0].assignedDate;
        selectedProvisionData[0].assignedDate = date.split("-").reverse().join("-");
        var payload = selectedProvisionData;
        GenericApiService.Post(url, payload, true).then(response => {
          if (response.status.success === "Success") {
            that.setState({
              showDeleteMulAssets: false
            });

            that.getProvisionList();
          }
        });
      },
      onCancel() {}
    });
  };

  addAsset = () => {
    this.setState({
      addAsstePopup: true
    });
  };
  addAssetsSave = () => {
    this.getProvisionList();
    this.setState({
      addAsstePopup: false
    });
    // this.props.changeNextTab("training");
  };
  addAssetCancel = () => {
    this.setState({
      addAsstePopup: false
    });
  };
  editAsset = selectedAssetData => {
    this.setState({
      editAsstePopup: true,
      selectedAssetData: selectedAssetData
    });
  };
  editAssetsSave = () => {
    this.getProvisionList();
    this.setState({
      editAsstePopup: false
    });
  };
  editAssetCancel = () => {
    this.setState({
      editAsstePopup: false
    });
  };
  startProvisioning = () => {
    var url =
      UrlConstant.startProvision +
      "employeeId=" +
      this.empId +
      "&logginedUserId=" +
      this.userId;
    var payload = "";
    this.setState({
      button_loader: true
    });
    GenericApiService.Post(url, payload, true).then(response => {
      if (response.status.success === "Success") {
        this.getProvisionList();
      } else {
        this.setState({
          disableStartProvision: false,
          button_loader: false
        });
      }
    });
  };

  generateConfidentalityLatter = () => {
    var file = new FormData();
    var pdf = new File([" "], "filename.pdf", {
      type: "text/plain",
      lastModified: new Date()
    });
    file.append("files", pdf);

    GenericApiService.saveformdata(
      UrlConstant.autoUploadDocument +
        this.empId +
        "&documentCode=" +
        UrlConstant.confidentalityLetterCode,
      file,
      true
    )
      .then(response => {
        console.log(response);
        if (response.status.success == "Success") {
          this.props.changeNextTab("document");
        } else {
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    return (
      <div>
        {this.state.addAsstePopup ? (
          <AddAssets
            showHidePopup={this.state.addAsstePopup}
            empId={this.props.tabObj.queryDetail.eid}
            onOk={this.addAssetsSave}
            onCancel={this.addAssetCancel}
            keyboard={false}
          />
        ) : null}
        {this.state.editAsstePopup ? (
          <EditAssets
            showHidePopup={this.state.editAsstePopup}
            empId={this.props.tabObj.queryDetail.eid}
            selectedAssetData={this.state.selectedAssetData}
            onOk={this.editAssetsSave}
            onCancel={this.editAssetCancel}
            keyboard={false}
          />
        ) : null}

        <div className="row search-row">
          <div className="col-lg-12">
            <Search
              placeholder="Search"
              onChange={this.onSearch}
              onKeyPress={e => {
                commonService.removeFocus(this.refs, e);
              }}
              ref="input"
            />
            {this.state.showDeleteMulAssets === true ? (
              <Button
                className="btn-with-icon ml-4"
                type="primary"
                shape="round"
                icon="delete"
                onClick={this.showDeleteConfirm.bind(
                  this,
                  this.state.selectedAssetRows
                )}
              >
                Delete Assets
              </Button>
            ) : null}
            <Button
              className="btn-with-icon ml-4"
              type="primary"
              shape="round"
              icon="plus"
              disabled={this.state.disableButton}
              onClick={this.addAsset}
            >
              Add Asset
            </Button>

            <Button
              className="btn-with-icon ml-4"
              type="primary"
              shape="round"
              icon="plus"
              onClick={this.startProvisioning}
              loading={this.state.button_loader}
              disabled={this.state.disableStartProvision}
            >
              Start Provisioning
            </Button>

            <Button
              className="btn-with-icon ml-4"
              type="primary"
              shape="round"
              icon="file-text"
              onClick={this.generateConfidentalityLatter}
            >Confidentiality Agreement
            </Button>
          </div>
        </div>
        <div className="row table-row">
          <div className="col-lg-12">
            <div className="table-responsive">
              <Table
                {...this.state}
                rowSelection={this.state.rowSelection}
                columns={ColumnConstant.assestColumn}
                pagination={false}
                dataSource={
                  this.state.provisionList ? (
                    this.state.provisionList
                  ) : (
                    <Spin style={{}} />
                  )
                }
              />
            </div>
          </div>
        </div>
        <div className="row pagination-row">
          <div className="col-lg-12 text-right">
            <Pagination
              size="small"
              total={this.state.totalPagesCount}
              showSizeChanger
              onShowSizeChange={this.onShowSizeChange}
              showTotal={this.showTotal}
              onChange={this.onpagechange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default Provision;
