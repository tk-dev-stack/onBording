import React from 'react'
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'
import UrlConstant from '../../Utils/UrlConstant';
import { GenericApiService } from '../../Utils/GenericService';

import {
    Input,
    Form,
    Modal,
    Select,
    Button

} from 'antd'

const Option = Select.Option;
const FormItem = Form.Item
class EditDesignation extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            departmentList: [],
            desCount: 0
        }
    }
    onCancel = () => {
        this.props.onCancel()
    }

    componentDidMount = () => {
        this.getDepartmentList();
        if (this.props.editobj.description != undefined) {
            console.log(this.props.editobj.description.length)
            this.setState({ desCount: this.props.editobj.description.length })
        }
    }
    getDepartmentList = () => {
        var organisationId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
        var url = UrlConstant.departmentDList + '?organisationId=' + organisationId;
        var payload = ''
        GenericApiService.Post(url, payload).then((response) => {

            this.setState({
                departmentList: response.data
            })

        })
    }
    addDesignationSave = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                var organisationId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
                var userId = EncryptDecryptSessionStorageService.getSessionStorage('userId');
                var url = UrlConstant.saveDesignation;
                var payload = this.props.editobj;
                payload.name = values.designationName;
                payload.organisationId = organisationId;
                payload.updatedBy = userId;
                payload.description = values.description;
                payload.isActive = true;
                payload.department = {
                    "departmentId": this.props.editobj.department.departmentId
                };
                this.setState({
                    submitBtn: true
                });
                GenericApiService.Post(url, payload, true).then((response) => {
                    this.setState({
                        submitBtn: false
                    });
                    this.props.onOk()

                }, error => {
                    this.setState({
                        submitBtn: true
                    });
                })
            }
        })

    }
    onSelectDep = (e) => {
        var departmentObj = this.state.departmentList[e]

        this.setState({
            selectedDepartment: departmentObj.departmentName
        })
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
                        title="Edit Designation"
                        onCancel={this.onCancel}
                        onOk={this.addDesignationSave}
                        // okText="Update"
                        centered
                        keyboard={false}
                        footer={[
                            <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                                Cancel
                            </Button>,
                            <Button key="submit" shape="round" type="primary"
                                loading={this.state.submitBtn}
                                onClick={this.addDesignationSave}
                                disabled={hasErrors(getFieldsError())}>
                                Update
                            </Button>,
                        ]}
                        okButtonProps={
                            !hasErrors(getFieldsError()) ? { disabled: false } : { disabled: true }
                        }   >

                        <Form hideRequiredMark onSubmit={this.handleSubmit}>

                            <Form.Item label="Department">
                                {getFieldDecorator('department', {
                                    initialValue: this.props.editobj.department.name,

                                    rules: [{ required: true, message: 'Please  select Department' },
                                    ],
                                })(
                                    <Select id="name" style={{ width: '100%' }}
                                        onChange={this.onSelectDep.bind(this)}
                                        showSearch
                                        optionFilterProp="children"
                                        filterOption={(input, option) =>
                                            option.props.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >= 0
                                        }>
                                        {this.state.departmentList.map((department, index) => {
                                            return (
                                                <Option key={index}
                                                    value={index}>{department.departmentName}</Option>

                                            )
                                        })}


                                    </Select>
                                )}
                            </Form.Item>
                            <FormItem label="Designation">
                                {getFieldDecorator('designationName', {
                                    initialValue: this.props.editobj.name,
                                    rules: [{ required: true, message: 'Please enter designation name' },
                                    ],
                                })(
                                    <Input id="designation-name" maxLength={30} />
                                )}

                            </FormItem>

                            <FormItem label="Description">
                                {getFieldDecorator('description', {

                                    initialValue: this.props.editobj.description,
                                    rules: [{ required: false },
                                    ],
                                })(
                                    <Input id="designation-description" maxLength={30} onChange={this.count.bind(this)} />
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
const WrappedEditDesignationForm = Form.create({ name: 'editDesignation' })(EditDesignation);

export default WrappedEditDesignationForm;
