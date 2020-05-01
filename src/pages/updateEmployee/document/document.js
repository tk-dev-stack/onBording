import React, { Component } from "react";
import { Row, Col, Upload, Button, Icon, Spin, Modal, Tooltip, Alert } from "antd";
import AddFile from "./addFile";
import EditFile from "./editFile";
import del from "../../../assets/del.svg";
import { EncryptDecryptSessionStorageService } from "../../../Utils/EncryptDecryptSessionStorageService";
import UrlConstant from "../../../Utils/UrlConstant";
import { GenericApiService } from "../../../Utils/GenericService";
import { DocumentPreview } from "./documentPreview";

const { confirm } = Modal;
class Documents extends Component {
  constructor(props) {
    super(props);
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage("orgId");
    this.state = {
      documentList: [],
      documentOfEmp: [],
      addFilePopup: false,
      fileList: [],
      Upload: false,
      loading: true,
      editDocPopup: false,
      editFilePop: false,
      documentPreview: false,
      documentObject: "",
      selectedIndex: null
    };
    console.log(this.props.docUpload);
  }

  componentWillReceiveProps(newProps) {
    if (
      newProps.tabObj.openTab == "salary" ||
      newProps.tabObj.openTab == "provision" ||
      newProps.tabObj.openTab == "document"
    ) {
      this.getDocumentList();
    }
  }

  getDocumentList() {
    const empId = this.props.tabObj.employeeId;
    const orgId = this.orgId;
    GenericApiService.Post(
      UrlConstant.employeeDocumentListById +
      "?organisationId=" +
      orgId +
      "&employeeId=" +
      empId,
      "",
      false
    )
      .then(response => {
        if (response.data == null) {
          this.setState({
            documentList: [],
            loading: false
          });
          this.getEmployeeId(empId);
        } else if (
          response.data.length !== 0 &&
          response.status.success == "Success"
        ) {
          this.setState({
            documentList: response.data,
            loading: false
          });
          this.getEmployeeId(empId);
        }
      })
      .catch(function (err) {
        return console.log(err);
      });
  }
  componentWillMount() {
    this.getDocumentList();
  }

  dismissPreview = () => {
    this.setState({
      documentPreview: false
    });
  };

  addFile = item => {
    this.setState({
      addFilePopup: true,
      dataDoc: {
        orgId: this.orgId,
        empId: this.props.tabObj.queryDetail.eid,
        documentList: this.state.documentOfEmp
      }
    });
  };
  editFile = item => {
    this.setState({
      editFilePop: true,
      editDoc: {
        orgId: item.organisationId,
        documentTypeId: item.documentTypeId,
        empId: this.props.tabObj.queryDetail.eid,
        documentList: this.state.documentOfEmp
      }
    });
  };
  addFileCancel = () => {
    this.setState({
      addFilePopup: false
    });
  };
  addFileOk = () => {
    this.setState({
      addFilePopup: false,
      loading: true
    });
    // this.props.changeNextTab("provision");
    this.getDocumentList();
  };

  editFileCancel = () => {
    this.setState({
      editFilePop: false
    });
  };
  editFileOk = () => {
    this.setState({
      editFilePop: false,
      loading: true
    });
    // this.props.changeNextTab("provision");
    this.getDocumentList();
  };

  addDoc = () => {
    this.setState({
      addDocPopup: true,
      item: this.props.tabObj.employeeId
    });
  };
  addDocCancel = () => {
    this.setState({
      addDocPopup: false
    });
  };
  addDocOk = () => {
    this.setState({
      addDocPopup: false,
      loading: true
    });
    this.getDocumentList();
  };
  editDocument = item => {
    this.setState({
      selectedEditItem: item,
      editFilePop: true
    });
  };
  editDocOk = () => {
    this.setState({
      editFilePop: false,
      loading: true
    });
    this.getDocumentList();
  };
  editDocCancel = () => {
    this.setState({
      editFilePop: false
    });
  };

  showConfirm = data => {
    let that = this;
    confirm({
      title: "Do you want to delete this document?",
      content: data.name,
      onOk() {
        GenericApiService.Post(
          UrlConstant.deleteDocumentDetail +
          "?documentDetailId=" +
          data.documentDetailId,
          "",
          true
        )
          .then(response => {
            if (response.status.success === "Success") {
              that.getDocumentList();
            }
          })
          .catch(function (err) {
            return console.log(err);
          });
      },
      onCancel() {
        console.log("Cancel");
      }
    });
  };

  deleteDocument = selectedItem => {
    let that = this;
    confirm({
      title: "Are you sure to delete this document ?",
      okText: "Yes",
      okType: "primary",
      cancelText: "No",
      centered: true,
      onOk() {
        var url =
          UrlConstant.deleteDocument + "?documentId=" + selectedItem.documentId;
        var payload = "";

        GenericApiService.Post(url, payload, true).then(response => {
          if (response.status.success === "Success") {
            that.getDocumentList();
          }
        });
      },
      onCancel() { }
    });
  };

  downloadDocument = (e, index) => {
    this.setState({ documentObject: '', selectedIndex: index });
    const url = UrlConstant.documentPreviewUrl + e.documentDetailId;
    GenericApiService.GetAll(url, false).then(resp => {

      setTimeout(() => {
        if (resp.data.documentPreviewPath) {
          const fileType = resp.data.name.includes('.jpg') ||
            resp.data.name.includes('.png') ||
            resp.data.name.includes('.jpeg');
          if (fileType) {
            this.setState({
              selectedIndex: null
            })
            window.location.href = resp.data.documentPreviewPath;
          } else {
            this.setState({
              documentObject: resp.data.documentPreviewPath,
              documentPreview: true,
              selectedIndex: null
            })  
          }
        } else {
          this.setState({
            selectedIndex: null
          })
        }
      }, 2000);
    }).catch(error => {
      this.setState({
        selectedIndex: null
      })
    });
  };

  getEmployeeId(empId) {
    GenericApiService.Post(
      UrlConstant.employeeById + "?employeeId=" + empId,
      "",
      false
    )
      .then(response => {
        if (
          response.data.length !== 0 &&
          response.status.success == "Success"
        ) {
          this.setState({
            employeeDetail: response.data,
            documentOfEmp: response.data.documentDetailList,
            loading: false
          });
        }
      })
      .catch(function (err) {
        return console.log(err);
      });
  }

  render() {
    return (
      <div>
        <Spin spinning={this.state.loading} delay={500}>
          {this.state.documentPreview ? (
            <DocumentPreview
              showHidePopup={this.state.documentPreview}
              previewDocument={this.state.documentObject}
              onCancel={this.dismissPreview}
              empId={this.props.tabObj.queryDetail.eid}
            />
          ) : null}
          {this.state.addFilePopup ? (
            <AddFile
              showHidePopup={this.state.addFilePopup}
              data={this.state.dataDoc}
              onOk={this.addFileOk}
              item={this.state.item}
              onCancel={this.addFileCancel}
              keyboard={false}
            />
          ) : null}
          {this.state.editFilePop ? (
            <EditFile
              showHidePopup={this.state.editFilePop}
              data={this.state.editDoc}
              onOk={this.editFileOk}
              item={this.state.item}
              onCancel={this.editFileCancel}
              keyboard={false}
            />
          ) : null}

          {this.state.documentList.map((item, index) => {
            return (
              <div className="row docs-row" key={index}>
                <div className="col-md-4 col-sm-6 p-0">
                  <span className="folder-name">
                    {index + 1}. {item.folderName}
                  </span>
                </div>
                <div className="col-md-6 col-sm-3 col-6 p-0">
                  {this.props.permission.empPermission.isCreate == true ? (
                    <Button
                      type="primary"
                      shape="round"
                      className="btn-with-icon"
                      icon="plus"
                      onClick={this.editFile.bind(this, item)}
                    >
                      Add Files
                    </Button>
                  ) : null}
                </div>
                <div className="col-md-2 col-sm-3 col-6 p-0 action-btn">
                  <a onClick={this.deleteDocument.bind(this, item)}>
                    <img src={del} alt="del" />
                  </a>
                </div>
                <div className="col-md-12 pl-0 attached-docs">
                  {this.state.documentOfEmp.map((e, index) => {
                    return e.document.folderName == item.folderName ? (
                      <div className="employeeDoc" key={index}>
                        <Tooltip placement="top" title={e.name}>
                          <span className="file-name">{e.name}</span>
                        </Tooltip>
                        {this.state.selectedIndex == index ? <Icon type="loading" className="download-icon" />
                          :
                          <Icon
                            type="vertical-align-bottom"
                            className="download-icon"
                            onClick={() => this.downloadDocument(e, index)}
                          />}
                        {this.props.permission.empPermission.isDelete ==
                          true ? (
                            <Icon
                              type="close-circle"
                              onClick={() => this.showConfirm(e)}
                            />
                          ) : null}

                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}

          <div className="row add-more-docs">
            <div className="col-lg-12 p-0">
              {this.props.permission.empPermission.isCreate == true ? (
                <a href="javascript:;" onClick={this.addFile.bind()}>
                  + Add More Files
                </a>
              ) : null}
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}

export default Documents;
