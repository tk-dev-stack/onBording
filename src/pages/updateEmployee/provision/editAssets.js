import React from "react";
import {
  Input,
  Form,
  Modal,
  Select,
  Button,
  Icon,
  Divider,
  DatePicker
} from "antd";
import UrlConstant from "../../../Utils/UrlConstant";
import { EncryptDecryptSessionStorageService } from "../../../Utils/EncryptDecryptSessionStorageService";
import { GenericApiService } from "../../../Utils/GenericService";
import { restElement, isDeclareVariable } from "@babel/types";
import moment from "moment";

const Option = Select.Option;

const FormItem = Form.Item;
class EditAsstes extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      getAssetDList: [],
      addNewAsstePopup: false,
      assetname: "",
      assetStatusList: [],
      departmentDList: [],
      showOthersTextBox: false,
      desCount: 0,
      disableSave: false,
      dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY'],
    };
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage("orgId");
    this.userId = EncryptDecryptSessionStorageService.getSessionStorage(
      "userId"
    );
  }

  componentDidMount = () => {
    this.getAssetDList();
    this.getAssetStatusList();
    this.departmentDList();
    if (this.props.selectedAssetData.description != undefined) {
      this.setState({
        desCount: this.props.selectedAssetData.description.length
      });
    }
  };
  getAssetDList = () => {
    var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage(
      "orgId"
    );
    var url = UrlConstant.getAssetDList + "organisationId=" + organisatioId;
    var payload = "";
    GenericApiService.GetAll(url, payload).then(response => {
      if (response.data !== null && response.data !== "") {
        this.setState({
          getAssetDList: response.data
        });
      }
    });
  };
  getAssetStatusList = () => {
    var url = UrlConstant.getAssetStatusList;
    var payload = "";
    GenericApiService.GetAll(url, payload).then(response => {
      if (response.data !== null && response.data !== "") {
        this.setState({
          assetStatusList: response.data
        });
      }
    });
  };
  departmentDList = () => {
    var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage(
      "orgId"
    );
    var url = UrlConstant.departmentDList + "?organisationId=" + organisatioId;
    var payload = "";
    GenericApiService.Post(url, payload).then(response => {
      if (response.data !== null && response.data !== "") {
        this.setState({
          departmentDList: response.data
        });
      }
    });
  };
  onSelectAsset = e => {
    var assetDetails = this.state.getAssetDList[e];

    if (assetDetails.name === "Others") {
      this.setState({
        showOthersTextBox: true
      });
    }
  };
  newAssetSave = () => {
    this.props.form.validateFields(["otherAssetName"], (err, values) => {
      // ...
      if (!err) {
        var url = UrlConstant.saveAssetCategory;
        var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage(
          "orgId"
        );
        var payload = {
          name: values.otherAssetName,
          organisationId: organisatioId,
          isActive: true
        };
        GenericApiService.Post(url, payload, true).then(response => {
          if (response.status.success === "Success") {
            this.getAssetDList();
            this.setState({
              showOthersTextBox: false
            });
          }
        });
      }
    });
  };
  editAssets = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var assetDetails = this.state.getAssetDList[values.assetName];

        var url = UrlConstant.saveAsset;
        var payload = this.props.selectedAssetData;
        payload.assetId = this.props.selectedAssetData.assetId;
        payload.description = values.description;
        payload.updatedBy = this.userId;
        payload.assignedDate = moment(values.assignDate).format("YYYY-MM-DD");

        payload.organisationId = this.orgId;
        payload.employee.employeeId = this.props.empId;
        let obj = this.state.assetStatusList.find(
          x => x.statusId == values.assetStatus
        );
        payload.provisionStatus = obj;
        // if (this.props.selectedAssetData.provisionStatus.name === values.assetStatus) {
        //     payload.provisionStatus.statusId = this.props.selectedAssetData.provisionStatus.statusId
        // }
        // else {
        //     payload.provisionStatus.statusId = values.assetStatus
        // }
        if (
          this.props.selectedAssetData.department.name === values.department
        ) {
          payload.department.departmentId = this.props.selectedAssetData.department.departmentId;
        } else {
          payload.department.departmentId = values.department;
        }
        if (this.props.selectedAssetData.name === values.assetName) {
          payload.assetCategory.assetCategoryId = this.props.selectedAssetData.assetCategory.assetCategoryId;
          payload.name = values.assetName;
        } else {
          payload.assetCategory.assetCategoryId = assetDetails.id;
          payload.name = assetDetails.name;
        }

        this.setState({
          disableSave: true
        });
        GenericApiService.Post(url, payload, true).then(response => {
          this.setState({
            disableSave: false
          });
          if (response.status.success === "Success") {
            this.props.onOk();
          }
        }, error => {
          this.setState({
            disableSave: false
          });
        });
      }
    });
  };

  onCancel = () => {
    this.props.onCancel();
  };
  disabledDate = current => {
    return current < moment().subtract(1, "d");
    // Can not select days before today and today
    // return current && current > moment().endOf('day')
  };
  cancelOtherAsset = () => {
    this.setState({
      showOthersTextBox: false,
      disableSave: false
    });
  };

  count(e) {
    var val = e.target.value.length;
    this.setState({
      desCount: val
    });
  }
  render() {
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError,
      isFieldTouched
    } = this.props.form;


    console.log(this.props.selectedAssetData)
    function hasErrors(fieldsError) {
      return Object.keys(fieldsError).some(field => fieldsError[field]);
    }

    return (
      <div>
        <Form>
          <Modal
            className="role"
            visible={this.props.showHidePopup}
            title="Edit Asset"
            onCancel={this.onCancel}
            onOk={this.editAssets}
            // okText="Save"
            keyboard={false}
            footer={[
              <Button
                className="cancel-btn"
                key="back"
                shape="round"
                onClick={this.onCancel}
              >
                Cancel
              </Button>,

              <Button
                key="submit"
                shape="round"
                type="primary"
                onClick={this.editAssets}
                loading={this.state.disableSave}
                disabled={hasErrors(
                  getFieldsError([
                    "assetName",
                    "description",
                    "assignDate",
                    "assetStatus",
                    "department"
                  ])
                )}
              >
                Update
              </Button>
            ]}
          >
            <Form hideRequiredMark onSubmit={this.handleSubmit}>
              {this.state.showOthersTextBox === true ? (
                <div>
                  <Form.Item label="Other Asset Name">
                    {getFieldDecorator("otherAssetName", {
                      rules: [
                        { required: true, message: "Please enter asset name" }
                      ]
                    })(<Input id="otherAssetName" />)}
                  </Form.Item>
                  <Button
                    key="back"
                    className="mr-3 mb-4"
                    shape="round"
                    onClick={this.cancelOtherAsset}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    shape="round"
                    onClick={this.newAssetSave}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                  <Form.Item label="Asset Name">
                    {getFieldDecorator("assetName", {
                      initialValue: this.props.selectedAssetData.name,
                      rules: [
                        { required: true, message: "Please  select asset name" }
                      ]
                    })(
                      <Select
                        id="assetName"
                        style={{ width: "100%" }}
                        onChange={this.onSelectAsset}
                        showSearch
                        disabled
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                        disabled
                      >
                        {this.state.getAssetDList.map((asset, index) => {
                          return (
                            <Option key={index} value={index}>
                              {asset.name}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                )}
              <Form.Item label="Description">
                {getFieldDecorator("description", {
                  initialValue: this.props.selectedAssetData.description,
                  rules: [
                    { required: true, message: "Please enter description" }
                  ]
                })(
                  <Input
                    id="description"
                    maxLength={100}
                    onChange={this.count.bind(this)}
                  />
                )}
              </Form.Item>
              <div className="provison-desc-width">
                  {this.state.desCount} /100
                </div>
              <Form.Item label="Assign Date">
                {getFieldDecorator("assignDate", {
                  initialValue: moment(
                    this.props.selectedAssetData.assignedDate,
                    "DD-MM-YYYY"
                  ),
                  rules: [
                    { required: true, message: "Please select assign date" }
                  ]
                })(
                  <DatePicker
                    d="dob"
                    placeholder=""
                    format={this.state.dateFormatList}
                    style={{ width: "100%" }}
                    disabledDate={this.disabledDate}
                  />
                )}
              </Form.Item>
              <Form.Item label="Asset Status">
                {getFieldDecorator("assetStatus", {
                  initialValue: this.props.selectedAssetData.provisionStatus
                    ? this.props.selectedAssetData.provisionStatus.statusId
                    : "",
                  rules: [
                    {
                      required: true,
                      message: "Please enter select assetStatus"
                    }
                  ]
                })(
                  <Select
                    id="assetStatus"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {this.state.assetStatusList.map((status, index) => {
                      return (
                        <Option key={index} value={status.statusId}>
                          {status.name}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>

              <Form.Item label="Department">
                {getFieldDecorator("department", {
                  initialValue:
                    this.props.selectedAssetData.department !== null
                      ? this.props.selectedAssetData.department.name
                      : "",
                  rules: [
                    {
                      required: true,
                      message: "Please enter select department"
                    }
                  ]
                })(
                  <Select
                    id="department"
                    showSearch
                    filterOption={(input, option) =>
                      option.props.children
                        .toLowerCase()
                        .indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {this.state.departmentDList.map((department, index) => {
                      return (
                        <Option key={index} value={department.departmentId}>
                          {department.departmentName}
                        </Option>
                      );
                    })}
                  </Select>
                )}
              </Form.Item>
            </Form>
          </Modal>
        </Form>
      </div>
    );
  }
}
const WrappedEditAssetsForm = Form.create({ name: "EditAsstes" })(EditAsstes);

export default WrappedEditAssetsForm;
