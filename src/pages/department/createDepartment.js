
import React from 'react'
import UrlConstant from "../../Utils/UrlConstant";
import { GenericApiService } from '../../Utils/GenericService';
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'
import {
    Input,
    Form,
    Modal,
    Select,
    Button

} from 'antd'

const Option = Select.Option;
const FormItem = Form.Item
class CreateDepartment extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            employeeList: [],
            desCount: 0,
            loading: false,

        }
    }

    componentDidMount = () => {
        this.getEmployeeDList();
    }

    getEmployeeDList = () => {

        var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
        var url = UrlConstant.getEmpDList + organisatioId
        var payload = ''

        GenericApiService.Post(url, payload).then((response) => {
            if (response.status.success == 'Success') {
                this.setState({
                    employeeList: response.data
                })
            }
        })

    }
    onCancel = () => {
        this.props.onCancel()
    }
    addDepartment = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                
                var emplyeedetails = this.state.employeeList[values.leadEmail]
                var userId = EncryptDecryptSessionStorageService.getSessionStorage('userId')
                var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
                var url = UrlConstant.addDepartment
                var payload = {
                    "name": values.departmentName,
                    "description": values.description,
                    "leadEmail": (emplyeedetails != null) ? emplyeedetails.emailId : values.leadEmail,
                    "organisationId": organisatioId,
                    "createdBy": userId,
                    "updatedBy": userId,
                    "createdOn": new Date(),
                    "updatedOn": new Date(),
                    "isActive": true,
                }
                this.setState({
                    loading:true
                });
                GenericApiService.Post(url, payload, true).then((response) => {
                    this.setState({
                        loading:false
                    });
                    this.props.onOk()

                },error=>{
                    this.setState({
                        loading:false
                    });
                })
            }
        })

    }
    onSelectEmp = (e) => {
        if (e) {
            var emplyeedetails = this.state.employeeList[e]
            this.setState({
                selectedUserName: emplyeedetails.name
            });
        } else {
            this.setState({
                selectedUserName: e
            });
        }
    }

    count(e) {
        var val = e.target.value.length
        this.setState({
            desCount: val
        })
    }
    render() {
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form

        function hasErrors(fieldsError) {
            return Object.keys(fieldsError).some(field => fieldsError[field])
        }

        return (
            <div >

                <Form>

                    <Modal className="role"
                        visible={this.props.showHidePopup}
                        title="Create Department"
                        onCancel={this.onCancel}
                        onOk={this.addDepartment}
                        // okText="Save"
                        centered
                        keyboard={false}
                        footer={[
                            <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                                Cancel
                            </Button>,
                            <Button key="submit" shape="round" type="primary"
                                loading={this.state.loading}
                                onClick={this.addDepartment}
                                disabled={hasErrors(getFieldsError())}>
                                Add
                            </Button>,
                        ]}
                    >

                        <Form hideRequiredMark onSubmit={this.handleSubmit}>
                            <FormItem label="Department Name">
                                {getFieldDecorator('departmentName', {
                                    initialValue: this.state.selectedDepartmentName,
                                    rules: [{ required: true, message: 'Please enter  Department name' },
                                    ],
                                })(
                                    <Input id="department-name" maxLength={30} />
                                )}

                            </FormItem>
                            <Form.Item label="Department Email ID">
                                {getFieldDecorator('leadEmail', {

                                    // rules: [{ required: true, message: 'Please  select Department email Id' },
                                    // ],
                                })(
                                    <Select id="emailId" style={{ width: '100%' }}
                                        onChange={this.onSelectEmp.bind(this)}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.props.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >= 0
                                        } >
                                        <Option key={0} value={null}>--</Option>
                                        {this.state.employeeList.map((employee, index) => {
                                            return (
                                                <Option key={index}
                                                    value={index}>{employee.emailId}</Option>

                                            )
                                        })}


                                    </Select>
                                )}
                            </Form.Item>
                            <FormItem label="Description">
                                {getFieldDecorator('description', {
                                    initialValue: this.state.description,
                                    // rules: [{ required: true, message: 'Please enter description' },
                                    // ],
                                })(
                                    <Input id="description" maxLength={30} onChange={this.count.bind(this)} />
                                )}

                                <p style={{ float: 'right' }} >
                                    {this.state.desCount} /30
                                </p>
                            </FormItem>
                        </Form>
                    </Modal>
                </Form>
            </div>

        )
    }
}
const WrappedAddDepartmentForm = Form.create({ name: 'addDepartment' })(CreateDepartment);

export default WrappedAddDepartmentForm;
