import React from "react";
import {
  Form,
  Input,
  Icon,
  Select,
  Button,
  Upload,
  Checkbox,
  message
} from "antd";

import { Link } from "react-router-dom";

import { GenericApiService } from "../../Utils/GenericService";
import UrlConstant from "../../Utils/UrlConstant";
import { EncryptDecryptSessionStorageService } from "../../Utils/EncryptDecryptSessionStorageService";
import Directives from "../../Utils/directives";

const Option = Select.Option;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}

function beforeUpload(file) {
  const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG/JPEG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
}

class EditOrganisation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      designationDL: [],
      departmentDL: [],
      statusDL: [],
      employeeDL: [],
      organasationDetails: [],
      submitBtn: false,
      employeeList: []
    };
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage("orgId");
    this.userId = EncryptDecryptSessionStorageService.getSessionStorage(
      "userId"
    );

    this.getDepartmentList();
  }

  componentDidMount = () => {
    var orgId = EncryptDecryptSessionStorageService.getSessionStorage("orgId");
    var url = UrlConstant.getOrgById + "organisationId=" + orgId;
    var payload = "";
    GenericApiService.Post(url, payload).then(response => {
      if (response.data !== "" && response.data !== null) {
        this.setState({
          organasationDetails: response.data
        });
        const depId = response.data.hrDeptId ? response.data.hrDeptId : '';
        if (depId) {
          this.getEmployeeListByDepartmentId(depId);
        }
      }
    });
  };
  handleImageChange = info => {
    // if (info.file.status === 'uploading') {
    //   this.setState({ loading: true });
    //   return;
    // }
    // if (info.file.status === 'done') {
    //   this.setState({
    //     file: info.fileList
    //   })
    //   // Get this url from response in real world.
    //   getBase64(info.file.originFileObj, imageUrl =>
    //     this.setState({
    //       imageUrl,
    //       loading: false,
    //     }),
    //   );
    // }
    this.setState({
      file: info.fileList
    });
    // Get this url from response in real world.
    getBase64(info.file.originFileObj, imageUrl =>
      this.setState({
        imageUrl,
        loading: false
      })
    );
  };

  getDepartmentList = () => {
    GenericApiService.Post(
      UrlConstant.departmentDList + "?organisationId=" + this.orgId,
      "",
      false
    )
      .then(response => {
        if (
          response.data.length !== 0 &&
          response.status.success == "Success"
        ) {
          this.setState({
            departmentDL: response.data,
          });
        }
      })
  }

  getEmployeeByDepartmentId = (departmentId) => {

    const payload = { departmentId: departmentId };
    if (this.state.employeeList) {
      this.setState({
        employeeList: []
      })
      this.props.form.setFieldsValue({
        hrEmailId: '',
        hrDesignation: '',
        employeeId: ''
      })
    }
    // this.props.form.validateFields((error,value) => {
    //   console.log(value);

    // })
    GenericApiService.Post(UrlConstant.getEmpByDepartmentId, payload, false)
      .then(response => {
        if (response.data) {
          this.setState({
            employeeList: response.data
          })
        } else {
          if (response.data) {
            this.setState({
              employeeList: []
            })
            this.setFormValue('');
          }
        }
      }).catch((err) => {

      })
  }

  getEmployeeListByDepartmentId(depId) {
    const payload = { departmentId: depId };
    GenericApiService.Post(UrlConstant.getEmpByDepartmentId, payload, false)
      .then(response => {
        if (response.data) {
          this.setState({
            employeeList: response.data
          })
          this.setFormValue(this.state.organasationDetails);
        }
      })
  }

  onSelectEmployee = (emp) => {
    console.log(emp)
    if (emp) {
      const employee = this.getEmployeeObject(emp);
      this.props.form.setFieldsValue({
        hrEmailId: employee.emailId,
        hrDesignation: employee.designation,
      })
    }
  }

  updateOrg = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        var url = UrlConstant.saveOrganisation;

        var payload = this.state.organasationDetails;
        payload.name = values.orgName;
        payload.domainName = values.domainName;
        payload.ssoCreateUrl = values.ssoCreateUrl;
        payload.ssoDeleteUrl = values.ssoDeleteUrl;
        payload.applocation1CreateUrl = values.elmsCreateUrl;
        payload.applocation1DeleteUrl = values.elmsDeleteUrl;
        payload.emailService = values.emailService;
        payload.createdBy = parseInt(this.userId);
        payload.updatedBy = parseInt(this.userId);
        payload.isActive = true;
        payload.code = values.code;
        payload.hrEmailId = values.hrEmailId;
        payload.adminEmailId = values.adminEmailId;
        payload.hrName = this.getEmployeeObject(values.hrEmailId).name;
        payload.hrDesignation = values.hrDesignation;
        payload.hrDeptId = values.departmentId;


        if (payload.presentAddress != null) {
          payload.presentAddress.doorNo = values.doorNo;
          payload.presentAddress.street = values.street;
          payload.presentAddress.city = values.city;
          payload.presentAddress.state = values.state;
          payload.presentAddress.phoneNumber = values.phoneNumber;
          payload.presentAddress.pinCode = parseInt(values.pinCode);
          payload.presentAddress.isActive = true;
          payload.presentAddress.updatedBy = parseInt(this.userId);
          payload.presentAddress.organisationId = parseInt(this.orgId);
        } else {
          payload.presentAddress = {
            doorNo: values.doorNo,
            street: values.street,
            city: values.city,
            state: values.state,
            pinCode: parseInt(values.pinCode),
            isActive: true,
            updatedBy: parseInt(this.userId),
            createdBy: parseInt(this.userId),
            organisationId: parseInt(this.orgId)
          };
        }
        if (payload.permanentAddress != null) {
          payload.permanentAddress.doorNo = values.p_doorNo;
          payload.permanentAddress.street = values.p_street;
          payload.permanentAddress.city = values.p_city;
          payload.permanentAddress.state = values.p_state;
          payload.permanentAddress.phoneNumber = values.p_phoneNumber;
          payload.permanentAddress.pinCode = parseInt(values.p_pinCode);
          payload.permanentAddress.isActive = true;
          payload.permanentAddress.organisationId = parseInt(this.orgId);
          payload.permanentAddress.updatedBy = parseInt(this.userId);
        } else {
          payload.permanentAddress = {
            doorNo: values.p_doorNo,
            street: values.p_street,
            city: values.p_city,
            state: values.p_state,
            pinCode: parseInt(values.p_pinCode),
            isActive: true,
            updatedBy: parseInt(this.userId),
            createdBy: parseInt(this.userId),
            organisationId: parseInt(this.orgId)
          };
        }
        delete payload.presentAddress.createdOn;
        delete payload.presentAddress.updatedOn;
        delete payload.permanentAddress.createdOn;
        delete payload.permanentAddress.updatedOn;
        delete payload.logo;

        var formData = new FormData();
        formData.append("organisation", JSON.stringify(payload));
        if (this.state.file !== undefined) {
          formData.append("profile", this.state.file[0].originFileObj);
        }


        this.setState({
          submitBtn: true
        });
        GenericApiService.saveformdata(url, formData, true).then((response) => {

          this.setState({
            submitBtn: false
          });

          if (response.data.length !== 0 && response.status.success == 'Success') {
            this.props.history.push('/home/organisation')
            this.props.update(response.data);
          }
        }).catch((err) => {
          return console.log(err);
        });
      }
    });
  };

  sameaddress = () => {
    var values = this.props.form.getFieldsValue();
    if (values.sameasCurrent === false) {
      this.props.form.setFieldsValue({
        p_doorNo: values.doorNo,
        p_street: values.street,
        p_city: values.city,
        p_state: values.state,
        p_pinCode: values.pinCode
      });
    } else {
      this.props.form.setFieldsValue({
        p_doorNo: "",
        p_street: "",
        p_city: "",
        p_state: "",
        p_pinCode: ""
      });
    }
  };

  goback = () => {
    this.props.history.goBack();
  };



  setFormValue(data) {
    this.props.form.setFieldsValue({
      employeeId: data ? this.getEmployeeObject(data.hrEmailId).employeeId : '',
    });
  }

  getEmployeeObject(emp) {
    var employee;
    this.state.employeeList.filter(obj => {
      if (obj.employeeId == emp || obj.emailId == emp) {
        employee = obj;
      }
    });

    return employee;
  }

  render() {
    var orgDetails = this.state.organasationDetails;

    function hasErrors(fieldsError) {
      return Object.keys(fieldsError).some(field => fieldsError[field]);
    }
    const { handlenumberKeyPress, onlyAlpha } = Directives;

    const { getFieldDecorator, getFieldsError } = this.props.form;
    const uploadButton = (
      <div>
        <Icon type={this.state.imgloading ? "loading" : "plus"} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const imageUrl = this.state.imageUrl;

    return (
      <div className="main-content">
        <h4>
          {this.props.location.pathname !== "/home/dashboard" ? (
            <Icon type="arrow-left" onClick={this.goback} />
          ) : null}
          Edit Organisation
        </h4>
        <div className="card user-card emp-card edit-org-card">
          <form className="form-container pt-5">
            <div className="row">
              <div className="col-lg-8">
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Organisation Name">
                      {getFieldDecorator("orgName", {
                        initialValue: orgDetails.name,
                        rules: [
                          {
                            required: true,
                            message: "Please enter organisation name"
                          }
                        ]
                      })(<Input id="orgName" key="orgName" type="text" />)}
                    </Form.Item>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Admin Email Id">
                      {getFieldDecorator("adminEmailId", {
                        initialValue: orgDetails.adminEmailId,
                        rules: [
                          {
                            type: "email",
                            message: "Please enter a valid email id",
                            required: true
                          }
                        ]
                      })(
                        <Input
                          id="adminEmailId"
                          key="adminEmailId"
                          type="text"
                        />
                      )}
                    </Form.Item>
                  </div>

                </div>
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Department">
                      {getFieldDecorator("departmentId", {
                        initialValue: orgDetails.hrDeptId ?
                          orgDetails.hrDeptId : null,
                        rules: [
                          {
                            required: true,
                            message: "Please select department"
                          }
                        ]
                      })(
                        <Select
                          id="departmentId"
                          style={{ width: "100%" }}
                          onChange={this.getEmployeeByDepartmentId}
                          optionFilterProp="children"
                          showSearch
                          filterOption={(input, option) =>
                            option.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {this.state.departmentDL.map((e, index) => {
                            return (
                              <Option key={index} value={e.departmentId}>
                                {e.departmentName}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Employee">
                      {getFieldDecorator("employeeId", {
                        initialValue: null,
                        rules: [
                          {
                            required: true,
                            message: "Please select employee"
                          }
                        ]
                      })(
                        <Select
                          id="employeeId"
                          style={{ width: "100%" }}
                          onChange={this.onSelectEmployee}
                          optionFilterProp="children"
                          showSearch
                          filterOption={(input, option) =>
                            option.props.children
                              .toLowerCase()
                              .indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          {this.state.employeeList.map((e, index) => {
                            return (
                              <Option key={index} value={e.employeeId}>
                                {e.name}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    </Form.Item>
                  </div>
                </div>
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="HR Email Id">
                      {getFieldDecorator("hrEmailId", {
                        initialValue: orgDetails.hrEmailId,
                        rules: [
                          {
                            type: "email",
                            message: "Please enter a valid email id",
                            required: true
                          }
                        ]
                      })(<Input id="hrEmailId" key="hrEmailId" type="text" disabled />)}
                    </Form.Item>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Designation">
                      {getFieldDecorator("hrDesignation", {
                        initialValue: orgDetails.hrDesignation,
                        rules: [
                          {
                            message: "This filed is required.",
                            required: true
                          }
                        ]
                      })(<Input id="hrDesignation" key="hrDesignation" type="text" disabled />)}
                    </Form.Item>
                  </div>

                </div>
              </div>
              <div className="col-lg-4 mb-4">
                <Upload
                  id="output"
                  name="avatar"
                  listType="picture-card"
                  className="avatar-uploader"
                  showUploadList={false}
                  // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                  onChange={this.handleImageChange}
                  beforeUpload={beforeUpload}
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="avatar" />
                  ) : orgDetails.logo !== null ? (
                    <img src={orgDetails.logo} alt="avatar" />
                  ) : (
                        uploadButton
                      )}
                  <span className="edit">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14.005"
                      height="14.005"
                      viewBox="0 0 14.005 14.005"
                    >
                      <path className="a" d="M0,0H14V14H0Z" />
                      <path
                        className="b"
                        d="M9.454,6.513l.537.537L4.7,12.337H4.167V11.8L9.454,6.513M11.555,3a.584.584,0,0,0-.408.169L10.078,4.237l2.188,2.188,1.068-1.068a.581.581,0,0,0,0-.823L11.969,3.169A.573.573,0,0,0,11.555,3Zm-2.1,1.861L3,11.315V13.5H5.188L11.642,7.05,9.454,4.861Z"
                        transform="translate(-1.249 -1.249)"
                      />
                    </svg>
                  </span>
                </Upload>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12 mb-4">1. USA OFFICE ADDRESS</div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Door No">
                  {getFieldDecorator("doorNo", {
                    initialValue:
                      orgDetails.presentAddress == null
                        ? ""
                        : orgDetails.presentAddress.doorNo,
                    rules: [{ required: true, message: "Please enter door no" }]
                  })(
                    <Input
                      id="dor-no"
                      placeholder=""
                      // onKeyPress={handlenumberKeyPress}
                      maxLength={10}
                    />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-9 mb-4">
                <Form.Item label="Street">
                  {getFieldDecorator("street", {
                    initialValue:
                      orgDetails.presentAddress == null
                        ? ""
                        : orgDetails.presentAddress.street,
                    rules: [{ required: true, message: "Please enter street" }]
                  })(<Input id="street" placeholder="" />)}
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 mb-4">
                <Form.Item label="City">
                  {getFieldDecorator("city", {
                    initialValue:
                      orgDetails.presentAddress == null
                        ? ""
                        : orgDetails.presentAddress.city,
                    rules: [{ required: true, message: "Please enter city" }]
                  })(<Input id="city" placeholder="" />)}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="State">
                  {getFieldDecorator("state", {
                    initialValue:
                      orgDetails.presentAddress == null
                        ? ""
                        : orgDetails.presentAddress.state,
                    rules: [{ required: true, message: "Please enter state" }]
                  })(<Input id="state" placeholder="" />)}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Pincode">
                  {getFieldDecorator("pinCode", {
                    initialValue:
                      orgDetails.presentAddress == null
                        ? ""
                        : orgDetails.presentAddress.pinCode.toString(),
                    rules: [
                      { required: true, message: "Please enter pincode" },
                      { len: 5, message: "Enter vaild Pincode" }
                    ]
                  })(
                    <Input
                      onKeyPress={handlenumberKeyPress}
                      maxLength={6}
                      minLength={6}
                      id="pincode"
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Phone Number">
                  {getFieldDecorator("phoneNumber", {
                    initialValue:
                      orgDetails.presentAddress == null
                        ? ""
                        : orgDetails.presentAddress.phoneNumber
                          ? orgDetails.presentAddress.phoneNumber.toString()
                          : "",
                    rules: [
                      { required: true, message: "Please enter Phone Number" }
                    ]
                  })(<Input maxLength={15} id="phoneNumber" placeholder="" />)}
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-6 mb-4">2. INDIA OFFICE ADDRESS </div>
              <div className="col-lg-6 mb-4">
                {/* {getFieldDecorator('sameasCurrent', {
                  initialValue: false,
                })(
                  <Checkbox onChange={this.sameaddress}>Same as Current Address</Checkbox>
                )} */}
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Door No">
                  {getFieldDecorator("p_doorNo", {
                    initialValue:
                      orgDetails.permanentAddress == null
                        ? ""
                        : orgDetails.permanentAddress.doorNo,
                    rules: [{ required: true, message: "Please enter door no" }]
                  })(
                    <Input
                      id="dor-no"
                      placeholder=""
                    // onKeyPress={handlenumberKeyPress}
                    />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-9 mb-4">
                <Form.Item label="Street">
                  {getFieldDecorator("p_street", {
                    initialValue:
                      orgDetails.permanentAddress == null
                        ? ""
                        : orgDetails.permanentAddress.street,
                    rules: [{ required: true, message: "Please enter street" }]
                  })(<Input id="street" maxLength={30} placeholder="" />)}
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-3 mb-4">
                <Form.Item label="City">
                  {getFieldDecorator("p_city", {
                    initialValue:
                      orgDetails.permanentAddress == null
                        ? ""
                        : orgDetails.permanentAddress.city,
                    rules: [{ required: true, message: "Please enter city" }]
                  })(<Input id="city" placeholder="" />)}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="State">
                  {getFieldDecorator("p_state", {
                    initialValue:
                      orgDetails.permanentAddress == null
                        ? ""
                        : orgDetails.permanentAddress.state,
                    rules: [{ required: true, message: "Please enter state" }]
                  })(<Input id="state" placeholder="" />)}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Pincode">
                  {getFieldDecorator("p_pinCode", {
                    initialValue:
                      orgDetails.permanentAddress == null
                        ? ""
                        : orgDetails.permanentAddress.pinCode.toString(),
                    rules: [
                      { required: true, message: "Please enter pincode" },
                      { len: 6, message: "Enter vaild Pincode" }
                    ]
                  })(
                    <Input
                      onKeyPress={handlenumberKeyPress}
                      maxLength={6}
                      minLength={6}
                      id="pincode"
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Phone Number">
                  {getFieldDecorator("p_phoneNumber", {
                    initialValue:
                      orgDetails.presentAddress == null
                        ? ""
                        : orgDetails.presentAddress.phoneNumber
                          ? orgDetails.presentAddress.phoneNumber.toString()
                          : "",
                    rules: [
                      { required: true, message: "Please enter Phone Number" }
                    ]
                  })(<Input maxLength={15} id="phoneNumber" placeholder="" />)}
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 mb-4">3. SSO DETAILS</div>
              <div className="col-lg-12 mb-4">
                <Form.Item label="Domain Name">
                  {getFieldDecorator("domainName", {
                    initialValue: orgDetails.domainName,
                    rules: [
                      { required: true, message: "Please enter domain name" }
                    ]
                  })(<Input id="domainName" key="domainName" type="text" />)}
                </Form.Item>
              </div>
              <div className="col-lg-6 mb-4">
                <Form.Item label="SSO Create Url">
                  {getFieldDecorator("ssoCreateUrl", {
                    initialValue: orgDetails.ssoCreateUrl,
                    rules: [
                      {
                        required: false,
                        message: "Please enter sso create url "
                      }
                    ]
                  })(
                    <Input id="ssoCreateUrl" key="ssoCreateUrl" type="text" />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-6 mb-4">
                <Form.Item label="SSO Delete Url">
                  {getFieldDecorator("ssoDeleteUrl", {
                    initialValue: orgDetails.ssoDeleteUrl,
                    rules: [
                      {
                        required: false,
                        message: "Please enter  sso delete url "
                      }
                    ]
                  })(
                    <Input id="ssoDeleteUrl" key="ssoDeleteUrl" type="text" />
                  )}
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 mb-4">4. ELMS DETAILS</div>
              <div className="col-lg-6 mb-4">
                <Form.Item label="ELMS Create Url">
                  {getFieldDecorator("elmsCreateUrl", {
                    initialValue: orgDetails.applocation1CreateUrl,
                    rules: [
                      {
                        required: false,
                        message: "Please enter elms create url "
                      }
                    ]
                  })(
                    <Input id="elmsCreateUrl" key="elmsCreateUrl" type="text" />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-6 mb-4">
                <Form.Item label="ELMS Delete Url">
                  {getFieldDecorator("elmsDeleteUrl", {
                    initialValue: orgDetails.applocation1DeleteUrl,
                    rules: [
                      {
                        required: false,
                        message: "Please enter  elms delete url "
                      }
                    ]
                  })(
                    <Input id="elmsDeleteUrl" key="elmsDeleteUrl" type="text" />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-6 mb-4">
                <Form.Item label="Email Service">
                  {getFieldDecorator("emailService", {
                    initialValue: "G-Suite",
                    rules: [
                      {
                        required: true,
                        message: "Please enter select email Service"
                      }
                    ]
                  })(
                    <Select id="emailService" style={{ width: "100%" }}>
                      <Option value="G-Suite">G-Suite</Option>
                      <Option value="Office-365">Office-365</Option>
                      <Option value="Others">Others</Option>
                    </Select>
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-6 mb-4">
                <Form.Item label="Organisation Code">
                  {getFieldDecorator("code", {
                    initialValue:
                      orgDetails.code == null ? "" : orgDetails.code,
                    rules: [
                      {
                        type: "string",
                        required: true,
                        message: "Please enter organisation code"
                      }
                    ]
                  })(
                    <Input
                      maxLength={6}
                      id="code"
                      onKeyPress={onlyAlpha}
                      placeholder=""
                    />
                  )}
                </Form.Item>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <Link to="/home/organisation">
                  {" "}
                  <Button className="cancel-btn mr-4" shape="round">
                    Skip Now
                  </Button>
                </Link>
                <Button
                  type="primary"
                  shape="round"
                  className="login-btn"
                  onClick={this.updateOrg}
                  loading={this.state.submitBtn}
                  disabled={hasErrors(getFieldsError())}
                >
                  {" "}
                  Update
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );


  }


}

const WrappedEditOrgForm = Form.create({ name: "EditOrganisation" })(
  EditOrganisation
);

export default WrappedEditOrgForm;
