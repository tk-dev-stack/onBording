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

class AddPersonalDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      designationDL: [],
      departmentDL: [],
      statusDL: [],
      employeeDL: [],
      emailError: "",
      buttonDisabled: false,
      officialEmail: "",
      isEditOfficialEmail: true,
      success: "",
      error: "",
      sumbitBtn: false,
      isRequired: false,
      onLoading: true,
      dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY']

    };
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage("orgId");
    this.userId = EncryptDecryptSessionStorageService.getSessionStorage(
      "userId"
    );

    this.getReportingManagerDL();
    this.getDepartmentDL();
    this.getStatusDL();
    this.getOffEmail = this.getOffEmail.bind(this);
    this.getOffEmail2 = this.getOffEmail2.bind(this);
    this.domainName = EncryptDecryptSessionStorageService.getSessionStorage(
      "domainName"
    );
    console.log("domain name", this.domainName);
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
          this.setState({
            employeeDL: response.data,
            onLoading: false
          });
        }
      })
      .catch(function (err) {
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
      .catch(function (err) {
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
            statusDL: response.data,
            loading: false
          });
        }
      })
      .catch(function (err) {
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
      .catch(function (err) {
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
  handleChange = () => {
    this.setState({
      error: "",
      emailError: ""
    });
  };

  handleStatusChange = (value) => {
    this.state.statusDL.map(element => {
      if (element.statusId == value) {
        if (element.name == 'Termination'
          || element.name == 'Notice Period'
          || element.name == 'Relieved') {
          this.setState({
            isRequired: true
          })
        } else {
          this.setState({
            isRequired: false
          })
          this.props.form.setFieldsValue({
            dateOfResigned: null,
            relievingDate: null
          })
        }
      }
    })

  }

  savePersonalDetail = e => {
    this.checkMailExist();
    if (this.state.success != "") {
      var payload;
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          if (
            /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,3})$/.test(
              values.personalEmail
            )
          ) {
            this.setState({
              emailError: "",
              buttonDisabled: false,
              sumbitBtn: true,
              onLoading: true
            });
            payload = {
              firstName: values.firstName,
              lastName: values.lastName,
              // ctc: values.ctc?parseInt(values.ctc):0,
              officialEmail: (
                values.officialEmail +
                "@" +
                this.domainName
              ).toLowerCase(),
              emergencyContactNo: values.emergencyContactNo,
              personalEmail: values.personalEmail,
              personalContactNo: values.personalContactNo,
              dateOfJoin: values.dateOfJoin.format("YYYY-MM-DD"),
              gender: values.gender,
              bloodGroup: values.bloodGroup,
              dateOfBirth: values.dateOfBirth.format("YYYY-MM-DD"),
              organisationId: parseInt(this.orgId),
              attendance_Id: values.attendance_Id,
              sameAsCurrentAddress: values.sameasCurrent == true ? true : false,
              relievingDate: values.relievingDate ?
                values.relievingDate.format('YYYY-MM-DD')
                : null,
              dateOfResigned: values.dateOfResigned ?
                values.dateOfResigned.format('YYYY-MM-DD')
                : null,
              designation: {
                designationId: values.designation
              },
              department: {
                departmentId: values.department
              },
              status: {
                statusId: values.status
              },
              fatherOrSpouseName: values.fatherOrSpouseName,
              isMarried: values.isMarried,
              // reportingManager: {
              //     employeeId: values.reportingManager
              // },
              permanentAddress: {
                doorNo: values.p_doorNo.replace('&', 'and'),
                street: values.p_street.replace('&', 'and'),
                city: values.p_city.replace('&', 'and'),
                state: values.p_state.replace('&', 'and'),
                pinCode: parseInt(values.p_pinCode),
                organisationId: parseInt(this.orgId),
                isActive: true,
                createdBy: parseInt(this.userId),
                updatedBy: parseInt(this.userId)
              },
              presentAddress: {
                doorNo: values.doorNo.replace('&', 'and'),
                street: values.street.replace('&', 'and'),
                city: values.city.replace('&', 'and'),
                state: values.state.replace('&', 'and'),
                pinCode: parseInt(values.pinCode),
                organisationId: parseInt(this.orgId),
                isActive: true,
                createdBy: parseInt(this.userId),
                updatedBy: parseInt(this.userId)
              },
              createdBy: parseInt(this.userId),
              updatedBy: parseInt(this.userId)
            };
            if (
              values.reportingManager !== null &&
              values.reportingManager !== undefined
            ) {
              payload.reportingManager = {
                employeeId: values.reportingManager
              };
            } else {
              payload.reportingManager = null;
            }
            console.log(payload);
            var formData = new FormData();
            formData.append("employee", JSON.stringify(payload));
            if (this.state.file !== undefined) {
              formData.append("profile", this.state.file[0].originFileObj);
            }

            GenericApiService.saveformdata(
              UrlConstant.saveEmployee,
              formData,
              true
            )
              .then(response => {
                this.setState({
                  sumbitBtn: false,
                  onLoading: false
                });
                if (
                  response.data.length !== 0 &&
                  response.status.success == "Success"
                ) {
                  this.props.update(response.data);
                  // this.props.changeNextTab("salary");
                }
              })
              .catch(err => {
                this.setState({
                  sumbitBtn: false,
                  onLoading: false
                });
                return console.log(err);
              });
          } else {
            this.setState({
              emailError: "Please enter valid email address",
              buttonDisabled: true,
              sumbitBtn: false
            });
          }
        } else {
          this.foucsErrorFiled();
        }
      });
    } else {
      this.foucsErrorFiled();
    }
  };
  
  getOffEmail = event => {
    var offEmail = this.props.form.getFieldsValue().officialEmail;
    var splitinital = offEmail.split(".");
    if (offEmail.includes(".") == false) {
      var firstname = event.target.value.toLowerCase();
      const name = firstname.split(" ").join("");
      this.props.form.setFieldsValue({
        officialEmail: name
      });
    } else {
      var firstname = event.target.value.toLowerCase();
      const name = firstname.split(" ").join("");
      splitinital[0] = name;
      this.props.form.setFieldsValue({
        officialEmail: splitinital.join(".").toLowerCase()
      });
    }
  };
  getOffEmail2 = event => {
    var inital = event.target.value.charAt(0).toLowerCase();
    var offEmail = this.props.form.getFieldsValue().officialEmail;
    if (offEmail != "") {
      var splitinital = offEmail.split(".");
      console.log(splitinital);
      if (offEmail.includes(".") == false) {
        if (splitinital[splitinital.length - 1] !== inital) {
          this.props.form.setFieldsValue({
            officialEmail: offEmail + "." + inital.toLowerCase()
          });
        }
      }
      //if already initial exist...
      else {
        splitinital[splitinital.length - 1] = inital;
        this.props.form.setFieldsValue({
          officialEmail: splitinital.join(".").toLowerCase()
        });
      }
    }
  };
  changeOffMail = e => {
    this.setState({ success: "", error: "" });
    if (e.key == "Enter") {
      this.checkMailExist();
    }
  };
  onEnter = e => {
    this.setState({ success: "", error: "" });

    if (e.key == "Enter") {
      this.checkMailExist();
    }
    e = e ? e : window.event;
    var charCode = e.which ? e.which : e.keyCode;
    if (
      (charCode >= 33 && charCode <= 47) ||
      (charCode >= 58 && charCode <= 64) ||
      (charCode >= 91 && charCode <= 96) ||
      (charCode >= 123 && charCode <= 126)
    ) {
      e.preventDefault();
    }
  };

  foucsErrorFiled = () => {
    setTimeout(() => {
      var scroll = document.getElementsByClassName('has-error');
      if (scroll[0]) {
        document.getElementById(scroll[0]["children"][0]["children"][0].id).focus();
      }
    }, 500);
  }

  checkMailExist() {
    var offMail = this.props.form.getFieldsValue().officialEmail.toLowerCase();
    if (offMail != "" && offMail != ".") {
      GenericApiService.Post(
        UrlConstant.checkMailExist +
        "?suggestedOfficialMailId=" +
        offMail +
        "@" +
        this.domainName +
        "&organisationId=" +
        parseInt(this.orgId),
        "",
        false
      )
        .then(response => {
          if (response.status.success == "Success") {
            this.setState({ success: response.status.message, error: "" });
          } else {
            this.setState({ error: response.status.message, success: "" });
          }
        })
        .catch(function (err) {
          return console.log(err);
        });
    }else{
      this.props.form.validateFields((err, values) => {

      });
    }
  }
 
  render() {
    function hasErrors(fieldsError) {
      return Object.keys(fieldsError).some(field => fieldsError[field]);
    }
    const {
      getFieldDecorator,
      getFieldsError,
      getFieldError
    } = this.props.form;

    const { onlyAlpha,handlenumberKeyPress } = Directives;

    const uploadButton = (
      <div>
        <Icon type={this.state.imgloading ? "loading" : "plus"} />
        <div className="ant-upload-text">Upload</div>
      </div>
    );
    const imageUrl = this.state.imageUrl;

    return (
      <Spin spinning={this.state.onLoading} >
        <div className="form-container">
          <form>
            <div className="row">
              <div className="col-lg-8">
                <div className="row">
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="First Name">
                      {getFieldDecorator("firstName", {
                        rules: [
                          { required: true, message: "Please enter first name" }
                        ]
                      })(
                        <Input
                          id="first_name"
                          key="firstname"
                          type="text"
                          maxLength={30}
                          onChange={this.getOffEmail}
                          onKeyPress={this.onEnter}
                        />
                      )}
                    </Form.Item>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Last Name">
                      {getFieldDecorator("lastName", {
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
                          maxLength={30}
                          onChange={this.getOffEmail2}
                          onKeyPress={this.onEnter}
                        />
                      )}
                    </Form.Item>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Date of Birth">
                      {getFieldDecorator("dateOfBirth", {
                        rules: [
                          {
                            required: true,
                            message: "Please enter date of birth"
                          }
                        ]
                      })(
                        <DatePicker
                          d="dob"
                          placeholder="DOB"
                          style={{ width: "100%" }}
                          format={this.state.dateFormatList}
                          disabledDate={this.disabledDate}
                        />
                      )}
                    </Form.Item>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Personal Email ID">
                      {getFieldDecorator("personalEmail", {
                        rules: [
                          {
                            required: true,
                            message: "Please enter personal email iD"
                          }
                        ]
                      })(
                        <Input
                          type="email"
                          id="personal_emai"
                          onChange={this.handleChange}
                        // onBeforeInput={() => {
                        //     this.checkMailExist()
                        // }}
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
                    <Form.Item label="Official Email ID" className="inline-edit">
                      {getFieldDecorator("officialEmail", {
                        initialValue: this.state.officialEmail
                      })(
                        <Input
                          addonAfter={"@" + this.domainName}
                          type="text"
                          disabled={this.state.isEditOfficialEmail}
                          onKeyPress={this.changeOffMail}
                          id="officialEmail"
                        />
                      )}
                      {this.state.isEditOfficialEmail == true ? (
                        <Icon
                          type="edit"
                          onClick={() => {
                            this.setState({
                              isEditOfficialEmail: !this.state.isEditOfficialEmail
                            });
                          }}
                        />
                      ) : null}
                      <p className="error" style={{ color: "red" }}>
                        {this.state.error}
                      </p>
                      <p style={{ color: "green" }}>{this.state.success}</p>
                    </Form.Item>
                  </div>
                  <div className="col-lg-6 mb-4">
                    <Form.Item label="Emergency Contact Number">
                      {getFieldDecorator("emergencyContactNo", {
                        rules: [
                          {
                            required: true,
                            message: "Please enter emergency contact number"
                          },
                          {
                            len: 10,
                            message: "Enter Vaild Emergency Contact Number"
                          }
                        ]
                      })(
                        <Input
                          onKeyPress={handlenumberKeyPress}
                          id="emergencyContactNo"
                          maxLength={10}
                          minLength={10}
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
                  //   action="https://www.mocky.io/v2/5e16f8c13000002a00d56281"
                  onChange={this.handleImageChange}
                  beforeUpload={beforeUpload}
                >
                  {imageUrl ? <img src={imageUrl} alt="avatar" /> : uploadButton}
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
                    rules: [
                      { required: true, message: "Please select gender" }
                    ]
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
                    rules: [
                      { required: true, message: "Please select marital status" }
                    ]
                  })(
                    <Radio.Group className="radio" >
                      <Radio value={false}>Single</Radio>
                      <Radio value={true}>Married</Radio>
                    </Radio.Group>
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Father / Spouse Name">
                  {getFieldDecorator('fatherOrSpouseName', {
                    rules: [{ required: false, message: 'This field is required' },
                    ],
                  })(
                    <Input id="fatherOrSpouseName"
                      key="fatherOrSpouseName"
                      type="text"
                      maxLength={50}
                      onKeyPress={this.onEnter} />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Blood Group">
                  {getFieldDecorator("bloodGroup", {
                    rules: [
                      {
                        required: true,
                        message: "Please  select blood group"
                      }
                    ]
                  })(
                    <Select id="bloodGroup" style={{ width: "100%" }}>
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
                      maxLength={10}
                      minLength={10}
                    />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Date Of Joining">
                  {getFieldDecorator("dateOfJoin", {
                    rules: [
                      {
                        required: true,
                        message: "Please enter date Of joining"
                      }
                    ]
                  })(
                    <DatePicker
                      d="doj"
                      placeholder="DOJ"
                      style={{ width: "100%" }}
                      format={this.state.dateFormatList}
                      disabledDate={this.disabledDate}
                    />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-3 mb-4">
                <Form.Item label="Attendance Id">
                  {getFieldDecorator("attendance_Id", {
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
                      onKeyPress={this.onEnter}
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
                    rules: [{ required: true, message: "Please enter door no" }]
                  })(
                    <Input
                      id="doorNo"
                      // onKeyPress={handlenumberKeyPress}
                      maxLength={10}
                    />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-10 mb-2">
                <Form.Item label="Street">
                  {getFieldDecorator("street", {
                    rules: [{ required: true, message: "Please enter street" }]
                  })(<Input id="street" />)}
                </Form.Item>
              </div>
              <div className="col-lg-4 mb-4">
                <Form.Item label="City">
                  {getFieldDecorator("city", {
                    rules: [{ required: true, message: "Please enter city" }]
                  })(<Input id="city" onKeyPress={onlyAlpha}/>)}
                </Form.Item>
              </div>
              <div className="col-lg-4 mb-4">
                <Form.Item label="State">
                  {getFieldDecorator("state", {
                    rules: [{ required: true, message: "Please enter state" }]
                  })(<Input id="state" onKeyPress={onlyAlpha} />)}
                </Form.Item>
              </div>
              <div className="col-lg-4 mb-4">
                <Form.Item label="Pincode">
                  {getFieldDecorator("pinCode", {
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
                    rules: [{ required: true, message: "Please enter door no" }]
                  })(
                    <Input
                      id="p_doorNo"
                      // onKeyPress={handlenumberKeyPress}
                      maxLength={10}
                    />
                  )}
                </Form.Item>
              </div>
              <div className="col-lg-10 mb-2">
                <Form.Item label="Street">
                  {getFieldDecorator("p_street", {
                    rules: [{ required: true, message: "Please enter street" }]
                  })(<Input id="street" />)}
                </Form.Item>
              </div>
              <div className="col-lg-4 mb-4">
                <Form.Item label="City">
                  {getFieldDecorator("p_city", {
                    rules: [{ required: true, message: "Please enter city" }]
                  })(<Input id="city" onKeyPress={onlyAlpha} />)}
                </Form.Item>
              </div>
              <div className="col-lg-4 mb-4">
                <Form.Item label="State">
                  {getFieldDecorator("p_state", {
                    rules: [{ required: true, message: "Please enter state" }]
                  })(<Input id="state"  onKeyPress={onlyAlpha} />)}
                </Form.Item>
              </div>
              <div className="col-lg-4 mb-4">
                <Form.Item label="Pincode">
                  {getFieldDecorator("p_pinCode", {
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
                    />
                  )}
                </Form.Item>
              </div>
            </div>
            {/* Company Details */}
            <div className="row">
              <div className="col-lg-12 mb-4">COMPANY DETAILS</div>
              <div className="col-lg-4 mb-4">
                <Form.Item label="Department">
                  {getFieldDecorator("department", {
                    rules: [
                      { required: true, message: "Please  select department" }
                    ]
                  })(
                    <Select
                      id="department"
                      style={{ width: "100%" }}
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      onChange={this.onDepartmentChange}
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
                    rules: [
                      { required: true, message: "Please enter designation" }
                    ]
                  })(
                    <Select
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      id="designation"
                      style={{ width: "100%" }}
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
                    rules: [{ required: true, message: "Please enter status" }]
                  })(
                    <Select
                      showSearch
                      optionFilterProp="children"
                      onChange={this.handleStatusChange}
                      filterOption={(input, option) =>
                        option.props.children
                          .toLowerCase()
                          .indexOf(input.toLowerCase()) >= 0
                      }
                      id="status"
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
                  {getFieldDecorator(
                    "reportingManager",
                    {
                      rules: [{ required: true, message: 'Please select reporting manager' }]
                    }
                  )(
                    <Select
                      id="reportingManager"
                      showSearch
                      optionFilterProp="children"
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
                            {e.name}
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
              {this.state.isRequired == true ?
                (<>
                  <div className="col-lg-3 mb-4">
                    <Form.Item label="Resignation Date">
                      {getFieldDecorator("dateOfResigned", {
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
                          format={this.state.dateFormatList}
                          placeholder=""
                          // disabledDate={this.disableReleivingDate}
                        />
                      )}
                    </Form.Item>
                  </div>

                </>) : null}
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
                  onClick={this.savePersonalDetail}
                  loading={this.state.sumbitBtn}
                  disabled={
                    hasErrors(getFieldsError()) && this.state.success !== ""
                  }
                >
                  {" "}
                  Add
              </Button>
              </div>
            </div>
          </form>
        </div>
      </Spin>
    );
  }
}

const WrappedBasicDetailForm = Form.create({ name: "AddPersonalDetail" })(
  AddPersonalDetail
);

export default WrappedBasicDetailForm;
