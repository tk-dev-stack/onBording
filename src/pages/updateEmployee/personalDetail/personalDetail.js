import React, { Component } from "react";

import {
  Form,
  Input,
  Icon,
  Select,
  Button,
  DatePicker,
  Upload,
  Radio,
  Checkbox,
  message,
  Spin
} from "antd";

import { Link } from "react-router-dom";

import moment from "moment";
import { GenericApiService } from "../../../Utils/GenericService";
import UrlConstant from "../../../Utils/UrlConstant";
import { EncryptDecryptSessionStorageService } from "../../../Utils/EncryptDecryptSessionStorageService";
import Directives from "../../../Utils/directives";
const { TextArea } = Input;
const Option = Select.Option;

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
}
function beforeUpload(file) {
  const isJpgOrPng = file.type === "image/jpeg"
    || file.type === "image/png"
    || file.type === "image/jpg";
  if (!isJpgOrPng) {
    message.error("You can only upload JPG/PNG/JPEG file!");
  }
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isLt2M) {
    message.error("Image must smaller than 2MB!");
  }
  return isJpgOrPng && isLt2M;
}

class PersonalDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      RoleDropDownList: [],
      selectedFile: "",
      employeeDetail: {},
      designationDL: [],
      departmentDL: [],
      statusDL: [],
      employeeDL: [],
      emailError: "",
      submitBtn: false,
      isRequired: false,
      onLoading: true,
      dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY']

    };
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage("orgId");
    this.userId = EncryptDecryptSessionStorageService.getSessionStorage(
      "userId"
    );

    this.getDepartmentDL();
    this.getStatusDL();

    if (this.props.tabObj.queryDetail.isupdate == true) {
      this.getEmployeeById(this.props.tabObj.queryDetail.eid);
    }
  }

  getEmployeeById(eid) {
    GenericApiService.Post(
      UrlConstant.employeeById + "?employeeId=" + eid,
      "",
      false
    )
      .then(response => {
        if (
          response.data.length !== 0 &&
          response.status.success == "Success"
        ) {
          this.getReportingManagerDL();
          this.setState({
            employeeDetail: response.data,
            loading: false,
          });
          this.props.updatedName(
            response.data.employee.firstName !== null
              ? response.data.employee.firstName
              : "" +
              " " +
              (response.data.employee.lastName !== null
                ? response.data.employee.lastName
                : "")
          );
          if (
            response.data.employee.status.name == "Termination" ||
            response.data.employee.status.name == "Notice Period" ||
            response.data.employee.status.name == "Relieved"
          ) {
            this.setState({
              isRequired: true
            });
          } else {
            this.setState({
              isRequired: false
            });
            this.props.form.setFieldsValue({
              dateOfResigned: null,
              relievingDate: null
            });
          }
          this.getDesignationDL(response.data.employee.department.departmentId);
        }
      })
      .catch(err => {
        return console.log(err);
      });
  }

  getReportingManagerDL() {
    GenericApiService.Post(
      UrlConstant.employeeDList + "?organisationId=" + this.orgId,
      "",
      false
    )
      .then(response => {
        if (
          response.data.length !== 0 &&
          response.status.success == "Success"
        ) {
          var newemployyeeList = [];

          for (let employee of response.data) {
            if (
              employee.employeeId !==
              this.state.employeeDetail.employee.employeeId
            ) {
              newemployyeeList.push(employee);
              this.setState({
                employeeDL: newemployyeeList,
                onLoading: false
              });
            }
          }
        }
      })
      .catch(err => {
        return console.log(err);
      });
  }

  getDepartmentDL() {
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
      .catch(err => {
        return console.log(err);
      });
  }

  getStatusDL() {
    GenericApiService.GetAll(
      UrlConstant.statusList + "?statusCategory=Employee"
    )
      .then(response => {
        if (
          response.data.length !== 0 &&
          response.status.success == "Success"
        ) {
          this.setState({
            statusDL: response.data
          });
        }
      })
      .catch(err => {
        return console.log(err);
      });
  }
  getDesignationDL = value => {
    GenericApiService.Post(
      UrlConstant.designationDList + "?departmentId=" + value,
      "",
      false
    )
      .then(response => {
        if (response.status.success == "Success") {
          if (response.data.length !== 0) {
            this.setState({
              designationDL: response.data
            });
          }
        } else {
          this.setState({
            designationDL: []
          });
        }
      })
      .catch(err => {
        return console.log(err);
      });
  };
  onDepartmentChange = value => {
    this.getDesignationDL(value);
    this.props.form.setFieldsValue({
      designation: ""
    });
  };

  disabledDate = current => {
    // Can not select days before today and today
    return (
      (current && current > moment().endOf("day")) ||
      current < moment().subtract(200, "y")
    );
  };

  disableReleivingDate = current => {
    // Can not select days before today and today
    return (
      (current && current <= moment().day("day")) ||
      current <= moment().subtract(200, "y")
    );
  };

  handleImageChange = info => {
    // if (info.file.status === "uploading") {
    //   this.setState({ loading: true });
    //   return;
    // }
    // if (info.file.status === "done") {
    //   this.setState({
    //     file: info.fileList
    //   });
    //   // Get this url from response in real world.
    //   getBase64(info.file.originFileObj, imageUrl =>
    //     this.setState({
    //       imageUrl,
    //       loading: false
    //     })
    //   );
    // }
    this.setState({ loading: true, imageUrl: "" });
    setTimeout(() => {
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
    }, 0);
  };

  handleStatusChange = value => {
    this.state.statusDL.map(element => {
      if (element.statusId == value) {
        if (
          element.name == "Termination" ||
          element.name == "Notice Period" ||
          element.name == "Relieved"
        ) {
          this.setState({
            isRequired: true
          });
        } else {
          this.setState({
            isRequired: false
          });
          this.props.form.setFieldsValue({
            dateOfResigned: null,
            relievingDate: null
          });
        }
      }
    });
  };

  sameaddress = () => {
    var values = this.props.form.getFieldsValue();
    if (values.sameasCurrent == false) {
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
  addPersonalDetail = e => {
    var payload = this.state.employeeDetail.employee;
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        if (
          /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,3})$/.test(
            values.personalEmail
          )
        ) {
          payload.designation = {
            designationId: values.designation
          };
          payload.department = {
            departmentId: values.department
          };
          if (values.reportingManager !== null) {
            payload.reportingManager = {
              employeeId: values.reportingManager
            };
          } else {
            payload.reportingManager = null;
          }
          payload.status = {
            statusId: values.status
          };
          if (payload.presentAddress != null) {
            payload.presentAddress.doorNo = values.doorNo.replace('&', 'and');
            payload.presentAddress.street = values.street.replace('&', 'and');
            payload.presentAddress.city = values.city.replace('&', 'and');
            payload.presentAddress.state = values.state.replace('&', 'and');
            payload.presentAddress.pinCode = parseInt(values.pinCode);
            payload.presentAddress.isActive = true;
            payload.presentAddress.updatedBy = parseInt(this.userId);
            payload.presentAddress.organisationId = parseInt(this.orgId);
          } else {
            payload.presentAddress = {
              doorNo: values.doorNo.replace('&', 'and'),
              street: values.street.replace('&', 'and'),
              city: values.city.replace('&', 'and'),
              state: values.state.replace('&', 'and'),
              pinCode: parseInt(values.pinCode),
              isActive: true,
              updatedBy: parseInt(this.userId),
              createdBy: parseInt(this.userId),
              organisationId: parseInt(this.orgId)
            };
          }
          if (payload.permanentAddress != null) {
            payload.permanentAddress.doorNo = values.p_doorNo.replace('&', 'and');
            payload.permanentAddress.street = values.p_street.replace('&', 'and');
            payload.permanentAddress.city = values.p_city.replace('&', 'and');
            payload.permanentAddress.state = values.p_state.replace('&', 'and');
            payload.permanentAddress.pinCode = parseInt(values.p_pinCode);
            payload.permanentAddress.isActive = true;
            payload.permanentAddress.organisationId = parseInt(this.orgId);
            payload.permanentAddress.updatedBy = parseInt(this.userId);
          } else {
            payload.permanentAddress = {
              doorNo: values.p_doorNo.replace('&', 'and'),
              street: values.p_street.replace('&', 'and'),
              city: values.p_city.replace('&', 'and'),
              state: values.p_state.replace('&', 'and'),
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

          payload.firstName = values.firstName;
          payload.lastName = values.lastName;
          payload.gender = values.gender;
          payload.dateOfBirth = values.dateOfBirth.format("YYYY-MM-DD");
          payload.bloodGroup = values.bloodGroup;
          payload.personalEmail = values.personalEmail;
          payload.officialEmail = values.officialEmail;
          payload.personalContactNo = values.personalContactNo;
          payload.emergencyContactNo = values.emergencyContactNo;
          payload.updatedBy = parseInt(this.userId);
          // payload.ctc = values.ctc?values.ctc:0;
          payload.attendance_Id = values.attendance_Id;
          payload.sameAsCurrentAddress =
            values.sameasCurrent == true ? true : false;
          payload.dateOfJoin = values.dateOfJoin.format("YYYY-MM-DD");
          payload.relievingDate = values.relievingDate
            ? values.relievingDate.format("YYYY-MM-DD")
            : null;
          payload.dateOfResigned = values.dateOfResigned
            ? values.dateOfResigned.format("YYYY-MM-DD")
            : null;
          payload.fatherOrSpouseName = values.fatherOrSpouseName;
          payload.isMarried = values.isMarried;
          delete payload.updatedOn;
          delete payload.profileUrl;

          var formData = new FormData();
          formData.append("employee", JSON.stringify(payload));
          if (this.state.file !== undefined) {
            formData.append("profile", this.state.file[0].originFileObj);
          }
          this.setState({
            emailError: "",
            submitBtn: true,
            onLoading: true
          });
          GenericApiService.saveformdata(
            UrlConstant.saveEmployee,
            formData,
            true
          )
            .then(response => {
              if (
                response.data.length !== 0 &&
                response.status.success === "Success"
              ) {
                this.setState({
                  employeeDetail: {},
                  submitBtn: false,
                  onLoading: false
                });
                this.getEmployeeById(this.props.tabObj.queryDetail.eid);
                // this.props.changeNextTab("salary");
              }
            })
            .catch(err => {
              this.setState({
                submitBtn: false,
                onLoading: false

              });
              return console.log(err);
            });
        } else {
          this.setState({
            emailError: "Please enter valid email address",
            buttonDisabled: true,
            submitBtn: false
          });
        }
      } else {
        this.foucsErrorFiled();
      }
    });
  };

  foucsErrorFiled = () => {
    setTimeout(() => {
      var scroll = document.getElementsByClassName("has-error");
      if (scroll[0]) {
        document
          .getElementById(scroll[0]["children"][0]["children"][0].id)
          .focus();
      }
    }, 500);
  };

  handleChange = () => {
    this.setState({
      error: "",
      emailError: ""
    });
  };

  render() {
    var emp = this.state.employeeDetail.employee;

    function hasErrors(fieldsError) {
      return Object.keys(fieldsError).some(field => fieldsError[field]);
    }
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError
    } = this.props.form;
    
    const { alphaNumeric , onlyAlpha,handlenumberKeyPress } = Directives;

    const uploadButton = (
      <div>
        <Icon type={this.state.loading ? "loading" : "plus"} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const imageUrl = this.state.imageUrl;

    return (
      <Spin spinning={this.state.onLoading} delay={100}>
        <div className="form-container">
          {emp !== undefined ? (
            <form>
              <div className="row">
                <div className="col-lg-8">
                  <div className="row">
                    <div className="col-lg-6 mb-4">
                      <Form.Item label="First Name">
                        {getFieldDecorator("firstName", {
                          initialValue: emp.firstName,
                          rules: [
                            { required: true, message: "Please enter first name" }
                          ]
                        })(
                          <Input
                            id="first_name"
                            key="firstname"
                            type="text"
                            maxLength={30}
                            onKeyPress={alphaNumeric}
                            disabled
                          />
                        )}
                      </Form.Item>
                    </div>
                    <div className="col-lg-6 mb-4">
                      <Form.Item label="Last Name">
                        {getFieldDecorator("lastName", {
                          initialValue: emp.lastName,
                          rules: [
                            {
                              required: true,
                              message: "Please enter user last name"
                            }
                          ]
                        })(
                          <Input
                            id="lastname"
                            key="lastname"
                            type="text"
                            onKeyPress={alphaNumeric}
                            maxLength={30}
                          />
                        )}
                      </Form.Item>
                    </div>
                    <div className="col-lg-6 mb-4">
                      <Form.Item label="Date of Birth">
                        {getFieldDecorator("dateOfBirth", {
                          initialValue:
                            emp.dateOfBirth
                              ? moment(emp.dateOfBirth, "YYYY-MM-DD")
                              : null,
                          rules: [
                            {
                              required: true,
                              message: "Please enter date of birth"
                            }
                          ]
                        })(
                          <DatePicker
                            style={{ width: "100%" }}
                            d="dob"
                            format={this.state.dateFormatList}
                            disabledDate={this.disabledDate}
                          />
                        )}
                      </Form.Item>
                    </div>
                    <div className="col-lg-6 mb-4">
                      <Form.Item label="Personal Email ID">
                        {getFieldDecorator("personalEmail", {
                          initialValue: emp.personalEmail,
                          rules: [
                            {
                              required: true,
                              message: "Please enter personal email iD"
                            }
                            // { type: 'email', message: 'Please enter a valid email id' },
                          ]
                        })(
                          <Input
                            type="email"
                            id="personal_emai"
                            onChange={this.handleChange}
                          />
                        )}
                      </Form.Item>
                      {this.state.emailError ? (
                        <p style={{ color: "red", height: 30 }}>
                          {this.state.emailError}
                        </p>
                      ) : null}
                    </div>
                    <div className="col-lg-6 mb-4">
                      <Form.Item label="Official Email ID">
                        {getFieldDecorator("officialEmail", {
                          initialValue: emp.officialEmail,
                          rules: [
                            {
                              type: "email",
                              message: "Please enter a valid email id"
                            }
                          ]
                        })(<Input type="email" id="officialEmail" disabled />)}
                      </Form.Item>
                    </div>
                    <div className="col-lg-6 mb-4">
                      <Form.Item label="Emergency Contact Number">
                        {getFieldDecorator("emergencyContactNo", {
                          initialValue: emp.emergencyContactNo,
                          rules: [
                            {
                              required: true,
                              message: "Please enter emergency contact number"
                            },
                            { len: 10, message: "Enter Vaild Contact Number" }
                          ]
                        })(
                          <Input
                            onKeyPress={handlenumberKeyPress}
                            id="emergencyContactNo"
                            maxLength={10}
                          />
                        )}
                      </Form.Item>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <Upload
                    name="avatar"
                    id="output"
                    name="avatar"
                    listType="picture-card"
                    className="avatar-uploader"
                    showUploadList={false}
                    //  action='https://jsonplaceholder.typicode.com/posts/'
                    beforeUpload={beforeUpload}
                    onChange={this.handleImageChange}
                  >
                    {imageUrl ? (
                      <img src={imageUrl} alt="avatar" />
                    ) : emp.profileUrl !== null ? (
                      <img src={emp.profileUrl} alt="avatar" />
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
                  <span className="upload-hint">
                    Image size should be below 2MB Supported Formats (.png, .jpeg, .jpg)
                </span>
                </div>
              </div>

              <div className="row">
                <div className="col-lg-3 mb-4">
                  <Form.Item label="Gender">
                    {getFieldDecorator("gender", {
                      initialValue: emp.gender,
                      rules: [{ required: true, message: "Please select gender" }]
                    })(
                      <Radio.Group className="radio" onChange={this.onChange}>
                        <Radio value={"M"}>Male</Radio>
                        <Radio value={"F"}>Female</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-3 mb-4">
                  <Form.Item label="Marital Status">
                    {getFieldDecorator("isMarried", {
                      initialValue: emp.isMarried,
                      rules: [
                        {
                          required: true,
                          message: "Please select marital status"
                        }
                      ]
                    })(
                      <Radio.Group className="radio">
                        <Radio value={false}>Single</Radio>
                        <Radio value={true}>Married</Radio>
                      </Radio.Group>
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-3 mb-4">
                  <Form.Item label="Father / Spouse Name">
                    {getFieldDecorator("fatherOrSpouseName", {
                      initialValue: emp.fatherOrSpouseName,
                      rules: [
                        { required: false, message: "This field is required" }
                      ]
                    })(
                      <Input
                        id="fatherOrSpouseName"
                        key="fatherOrSpouseName"
                        type="text"
                        maxLength={50}
                      />
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-3 mb-4">
                  <Form.Item label="Blood Group">
                    {getFieldDecorator("bloodGroup", {
                      initialValue: emp.bloodGroup,
                      rules: [
                        {
                          required: true,
                          message: "Please  select blood group"
                        }
                      ]
                    })(
                      <Select id="bloodGroup">
                        <Option value="A+">A+</Option>
                        <Option value="B+">B+</Option>
                        <Option value="AB+">AB+</Option>
                        <Option value="O+">O+</Option>
                        <Option value="O-">O-</Option>
                        <Option value="AB-">AB-</Option>
                        <Option value="A-">A-</Option>
                        <Option value="B-">B-</Option>
                        <Option value="NA">NA</Option>
                      </Select>
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-3 mb-4">
                  <Form.Item label="Contact Number">
                    {getFieldDecorator("personalContactNo", {
                      initialValue: emp.personalContactNo,
                      rules: [
                        {
                          required: true,
                          message: "Please enter contact number"
                        },
                        { len: 10, message: "Enter Vaild Contact Number" }
                      ]
                    })(
                      <Input
                        id="personalContactNo"
                        onKeyPress={handlenumberKeyPress}
                        placeholder="Contact Number"
                        maxLength={10}
                        minLength={10}
                      />
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-3 mb-4">
                  <Form.Item label="Date Of Joining">
                    {getFieldDecorator("dateOfJoin", {
                      initialValue:
                        emp.dateOfJoin
                          ? moment(emp.dateOfJoin, "YYYY-MM-DD")
                          : null,
                      rules: [
                        {
                          required: true,
                          message: "Please enter date Of joining"
                        }
                      ]
                    })(
                      <DatePicker
                        style={{ width: "100%" }}
                        d="doj"
                        format={this.state.dateFormatList}
                        placeholder="DOJ"
                        disabledDate={this.disabledDate}
                      />
                    )}
                  </Form.Item>
                </div>

                <div className="col-lg-3 mb-4">
                  <Form.Item label="Attendance Id">
                    {getFieldDecorator("attendance_Id", {
                      initialValue: emp.attendance_Id,
                      rules: [
                        {
                          required: false,
                          message: "Please enter attendence id"
                        }
                      ]
                    })(
                      <Input
                        id="attendance_Id"
                        key="attendance_Id"
                        type="text"
                        maxLength={30}
                      />
                    )}
                  </Form.Item>
                </div>
              </div>

              {/* Current Address */}
              <div className="row">
                <div className="col-lg-12 mb-4">CURRENT ADDRESS</div>
                <div className="col-lg-2 mb-2">
                  <Form.Item label="Door No">
                    {getFieldDecorator("doorNo", {
                      initialValue:
                        emp.presentAddress !== null
                          ? emp.presentAddress.doorNo
                          : null,
                      rules: [{ required: true, message: "Please enter door no" }]
                    })(
                      <Input
                        id="dor-no"
                        className="col-sm-12"
                        placeholder="Door No"
                        maxLength={10}
                      />
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-10 mb-2">
                  <Form.Item label="Street">
                    {getFieldDecorator("street", {
                      initialValue:
                        emp.presentAddress !== null
                          ? emp.presentAddress.street
                          : null,
                      rules: [{ required: true, message: "Please enter street" }]
                    })(
                      <Input
                        id="street"
                        placeholder="Street"
                      // maxLength={10}
                      />
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-4 mb-4">
                  <Form.Item label="City">
                    {getFieldDecorator("city", {
                      initialValue:
                        emp.presentAddress !== null
                          ? emp.presentAddress.city
                          : null,
                      rules: [{ required: true, message: "Please enter city" }]
                    })(<Input id="city" onKeyPress={onlyAlpha} />)}
                  </Form.Item>
                </div>
                <div className="col-lg-4 mb-4">
                  <Form.Item label="State">
                    {getFieldDecorator("state", {
                      initialValue:
                        emp.presentAddress !== null
                          ? emp.presentAddress.state
                          : null,
                      rules: [{ required: true, message: "Please enter state" }]
                    })(
                      <Input
                        id="state"
                        className="col-sm-12"
                        onKeyPress={onlyAlpha}
                        placeholder="State"
                      />
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-4 mb-4">
                  <Form.Item label="Pincode">
                    {getFieldDecorator("pinCode", {
                      initialValue:
                        emp.presentAddress !== null
                          ? emp.presentAddress.pinCode.toString()
                          : null,
                      rules: [
                        { required: true, message: "Please enter pincode" },
                        { len: 6, message: "Please enter valid pincode" }
                      ]
                    })(
                      <Input
                        onKeyPress={handlenumberKeyPress}
                        maxLength={6}
                        minLength={6}
                        id="pincode"
                      />
                    )}
                  </Form.Item>
                </div>
              </div>
              {/* Permanent Address */}
              <div className="row">
                <div className="col-lg-6 mb-4">PERMANENT ADDRESS</div>
                <div className="col-lg-6 mb-4">
                  <Form.Item>
                    {getFieldDecorator("sameasCurrent", {
                      initialValue: false
                    })(
                      <Checkbox onChange={this.sameaddress}>
                        Same as Current Address
                    </Checkbox>
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-2 mb-2">
                  <Form.Item label="Door No">
                    {getFieldDecorator("p_doorNo", {
                      initialValue:
                        emp.permanentAddress !== null
                          ? emp.permanentAddress.doorNo
                          : null,
                      rules: [{ required: true, message: "Please enter door no" }]
                    })(
                      <Input
                        id="dor-no"
                        className="col-sm-12"
                        placeholder="Door No"
                        // onKeyPress={handlenumberKeyPress}
                        maxLength={10}
                      />
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-10 mb-2">
                  <Form.Item label="Street">
                    {getFieldDecorator("p_street", {
                      initialValue:
                        emp.permanentAddress !== null
                          ? emp.permanentAddress.street
                          : null,
                      rules: [{ required: true, message: "Please enter street" }]
                    })(
                      <Input
                        id="street"
                        placeholder="Street"
                      // maxLength={10}
                      />
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-4 mb-4">
                  <Form.Item label="City">
                    {getFieldDecorator("p_city", {
                      initialValue:
                        emp.permanentAddress !== null
                          ? emp.permanentAddress.city
                          : null,
                      rules: [{ required: true, message: "Please enter city" }]
                    })(<Input id="city" onKeyPress={onlyAlpha} />)}
                  </Form.Item>
                </div>
                <div className="col-lg-4 mb-4">
                  <Form.Item label="State">
                    {getFieldDecorator("p_state", {
                      initialValue:
                        emp.permanentAddress !== null
                          ? emp.permanentAddress.state
                          : null,
                      rules: [{ required: true, message: "Please enter state" }]
                    })(<Input id="state" onKeyPress={onlyAlpha} />)}
                  </Form.Item>
                </div>
                <div className="col-lg-4 mb-4">
                  <Form.Item label="Pincode">
                    {getFieldDecorator("p_pinCode", {
                      initialValue:
                        emp.permanentAddress !== null
                          ? emp.permanentAddress.pinCode.toString()
                          : null,
                      rules: [
                        { required: true, message: "Please enter pincode" },
                        { min: 6, message: "Please enter valid pincode" }
                      ]
                    })(
                      <Input
                        onKeyPress={handlenumberKeyPress}
                        maxLength={6}
                        minLength={6}
                        id="pincode"
                      />
                    )}
                  </Form.Item>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-12 mb-4">COMPANY DETAILS</div>
                <div className="col-lg-4 mb-4">
                  <Form.Item label="Department">
                    {getFieldDecorator("department", {
                      initialValue:
                        emp.department !== null
                          ? emp.department.departmentId
                          : null,
                      rules: [
                        { required: true, message: "Please  select department" }
                      ]
                    })(
                      <Select
                        id="department"
                        style={{ width: "100%" }}
                        onChange={this.onDepartmentChange}
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
                <div className="col-lg-4 mb-4">
                  <Form.Item label="Designation">
                    {getFieldDecorator("designation", {
                      initialValue:
                        emp.designation !== null
                          ? emp.designation.designationId
                          : null,
                      rules: [
                        { required: true, message: "Please enter designation" }
                      ]
                    })(
                      <Select
                        id="designation"
                        optionFilterProp="children"
                        showSearch
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.state.designationDL.map((e, key) => {
                          return (
                            <Option key={key} value={e.designationId}>
                              {e.name}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-4 mb-4">
                  <Form.Item label="Status">
                    {getFieldDecorator("status", {
                      initialValue:
                        emp.status !== null ? emp.status.statusId : null,
                      rules: [{ required: true, message: "Please enter status" }]
                    })(
                      <Select
                        id="status"
                        optionFilterProp="children"
                        showSearch
                        onChange={this.handleStatusChange}
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        {this.state.statusDL.map((e, key) => {
                          return (
                            <Option key={key} value={e.statusId}>
                              {e.name}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </div>
                <div className="col-lg-6 mb-6">
                  <Form.Item label="Reporting Manager">
                    {getFieldDecorator("reportingManager", {
                      initialValue:
                        emp.reportingManager !== null
                          ? emp.reportingManager.employeeId
                          : null,
                      rules: [
                        {
                          required: true,
                          message: "Please select reporting manager"
                        }
                      ]
                    })(
                      <Select
                        id="reportingManager"
                        optionFilterProp="children"
                        showSearch
                        filterOption={(input, option) =>
                          option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                        }
                      >
                        <Option key={0} value={null}>
                          --
                      </Option>
                        {this.state.employeeDL.map((e, key) => {
                          return (
                            <Option key={key} value={e.employeeId}>
                              {e.name + "(" + e.emailId + ")"}
                            </Option>
                          );
                        })}
                      </Select>
                    )}
                  </Form.Item>
                </div>
                {/* <div className="col-lg-4 mb-4">
                  <Form.Item label="CTC">
                    {getFieldDecorator("ctc", {
                      initialValue: emp.ctc !== null ? emp.ctc : null,
                      rules: [{ required: true, message: "Please enter ctc" }]
                    })(
                      <Input
                        onKeyPress={handlenumberKeyPress}
                        id="ctc"
                        maxLength={9}
                      />
                    )}
                  </Form.Item>
                </div> */}
                {this.state.isRequired ? (
                  <>
                    <div className="col-lg-3 mb-4">
                      <Form.Item label="Resignation Date">
                        {getFieldDecorator("dateOfResigned", {
                          initialValue:
                            emp.dateOfResigned
                              ? moment(emp.dateOfResigned, "YYYY-MM-DD")
                              : null,
                          rules: [
                            {
                              required: this.state.isRequired,
                              message: "Please enter resignation date"
                            }
                          ]
                        })(
                          <DatePicker
                            style={{ width: "100%" }}
                            d="doresig"
                            placeholder=""
                            format={this.state.dateFormatList}
                            // disabledDate={this.disableReleivingDate}
                          />
                        )}
                      </Form.Item>
                    </div>
                    <div className="col-lg-3 mb-4">
                      <Form.Item label="Relieving Date">
                        {getFieldDecorator("relievingDate", {
                          initialValue:
                            emp.relievingDate
                              ? moment(emp.relievingDate, "YYYY-MM-DD")
                              : null,
                          rules: [
                            {
                              required: this.state.isRequired,
                              message: "Please enter relieving date"
                            }
                          ]
                        })(
                          <DatePicker
                            style={{ width: "100%" }}
                            d="dor"
                            placeholder=""
                            format={this.state.dateFormatList}
                            // disabledDate={this.disableReleivingDate}
                          />
                        )}
                      </Form.Item>
                    </div>

                  </>
                ) : null}
              </div>
              <div className="row">
                <div className="col-lg-12">
                  <Link to="/home/dashboard">
                    {" "}
                    <Button className="cancel-btn mr-4" shape="round">
                      Cancel
                  </Button>
                  </Link>
                  <Button
                    type="primary"
                    shape="round"
                    className="login-btn"
                    loading={this.state.submitBtn}
                    onClick={this.addPersonalDetail}
                    disabled={hasErrors(getFieldsError())}
                  >
                    {" "}
                    Update
                </Button>
                </div>
              </div>
            </form>
          ) : null}
        </div>
      </Spin>
    );
  }
}

const WrappedBasicDetailForm = Form.create({ name: "PersonalDetail" })(
  PersonalDetail
);

export default WrappedBasicDetailForm;
