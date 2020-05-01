import React from "react";
import { Input, Form, Modal, Select, Button, Checkbox } from "antd";
import UrlConstant from "../../Utils/UrlConstant";
import { EncryptDecryptSessionStorageService } from "../../Utils/EncryptDecryptSessionStorageService";
import { GenericApiService } from "../../Utils/GenericService";
import { restElement } from "@babel/types";
const Option = Select.Option;

const FormItem = Form.Item;
class CreateUser extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            employeeList: [],
            roleList: [],
            selectedUserName: "",
            subminBtn:false
        };
    }

    componentDidMount = () => {
        this.getEmployeeDList();
        this.getRoleDList();
    };

    getEmployeeDList = () => {
        // var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
        var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage(
            "orgId"
        );
        var url = UrlConstant.getEmpDList + organisatioId;
        var payload = "";

        GenericApiService.Post(url, payload).then(response => {
            if (response.data !== "") {
                this.setState({
                    employeeList: response.data
                });
            }
        });
    };
    getRoleDList = () => {
        var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage(
            "orgId"
        );

        var url = UrlConstant.getRoleDList + organisatioId;
        var payload = "";
        GenericApiService.Post(url, payload).then(response => {
            if (response.data !== "") {
                this.setState({
                    roleList: response.data
                });
            }
        });
    };
    onCancel = () => {
        this.props.onCancel();
    };
    addUser = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                var emplyeedetails = this.state.employeeList[values.employee];
                var userId = EncryptDecryptSessionStorageService.getSessionStorage(
                    "userId"
                );
                var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage(
                    "orgId"
                );
                var url = UrlConstant.addUser;
                var payload = {
                    name: values.username,
                    email: emplyeedetails.emailId,
                    organisationId: organisatioId,
                    employeeId: emplyeedetails.employeeId,
                    createdBy: userId,
                    updatedBy: userId,
                    createdOn: new Date(),
                    updatedOn: new Date(),
                    isActive: true,
                    role: { roleId: values.role },
                   // isNotifyAssetMail: values.isNotifyAssetMail
                };
                     this.setState({
                        subminBtn:true
                     });
                GenericApiService.Post(url, payload, true).then(response => {
                    this.setState({
                        subminBtn:false
                     });
                    if (response.status.success === "Success") {
                        this.props.onOk();
                    }
                },error=>{
                    this.setState({
                        subminBtn:false
                     });
                });
            }
        });
    };
    onSelectEmp = e => {
        var emplyeedetails = this.state.employeeList[e];

        this.setState({
            selectedUserName: emplyeedetails.name
        });
    };

    render() {
        const {
            getFieldDecorator,
            getFieldsError,
            getFieldError,
            isFieldTouched
        } = this.props.form;

        function hasErrors(fieldsError) {
            return Object.keys(fieldsError).some(field => fieldsError[field]);
        }

        return (
            <div>
                <Form>
                    <Modal
                        className="role"
                        visible={this.props.showHidePopup}
                        title="Add User"
                        onCancel={this.onCancel}
                        onOk={this.addUser}
                        // okText="Save"
                        centered
                        keyboard={false}
                        footer={[
                            <Button
                                className="cancel-btn"
                                key="back"
                                shape="round"
                                onClick={this.onCancel}
                            > Cancel     </Button>,
                            <Button
                                key="submit"
                                shape="round"
                                type="primary"
                                onClick={this.addUser}
                                loading={this.state.subminBtn}
                                disabled={hasErrors(getFieldsError())}
                            > Add </Button>
                        ]}
                    >
                        <Form hideRequiredMark onSubmit={this.handleSubmit}>
                            <Form.Item label="Email ID">
                                {getFieldDecorator("employee", {
                                    rules: [
                                        { required: true, message: "Please  select email Id" }
                                    ]
                                })(
                                    <Select
                                        id="emailId"
                                        style={{ width: "100%" }}
                                        showSearch
                                        optionFilterProp="children"
                                        onChange={this.onSelectEmp.bind(this)}
                                        filterOption={(input, option) =>
                                            option.props.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {this.state.employeeList !== null
                                            ? this.state.employeeList.map((employee, index) => {
                                                return (
                                                    <Option key={index} value={index}>
                                                        {employee.emailId}
                                                    </Option>
                                                );
                                            })
                                            : null}
                                    </Select>
                                )}
                            </Form.Item>
                            <FormItem label="User Name">
                                {getFieldDecorator("username", {
                                    initialValue: this.state.selectedUserName,
                                    rules: [
                                        { required: true, message: "Please enter  user name" }
                                    ]
                                })(<Input id="user-name" />)}
                            </FormItem>
                            <Form.Item label="Role">
                                {getFieldDecorator("role", {
                                    rules: [{ required: true, message: "Please  select role" }]
                                })(
                                    <Select
                                        id="role"
                                        style={{ width: "100%" }}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.props.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >= 0
                                        }
                                    >
                                        {this.state.roleList.map((role, index) => {
                                            return (
                                                <Option key={index} value={role.roleId}>
                                                    {role.name}
                                                </Option>
                                            );
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                            {/* <Form.Item>
                                {getFieldDecorator("isNotifyAssetMail", {
                                    initialValue: false
                                })(
                                    <Checkbox >
                                        Notify Asset Mails
                                     </Checkbox>
                                )}
                            </Form.Item> */}
                        </Form>
                    </Modal>
                </Form>
            </div>
        );
    }
}
const WrappedAddUserForm = Form.create({ name: "addUser" })(CreateUser);

export default WrappedAddUserForm;
