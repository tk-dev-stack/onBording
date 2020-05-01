


import React from 'react'
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'

import {
    Input,
    Form,
    Modal,
    Select,
    Button
} from 'antd'
import { GenericApiService } from '../../Utils/GenericService';
import UrlConstant from '../../Utils/UrlConstant';

const Option = Select.Option;
const FormItem = Form.Item
class CreateDesignation extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            departmentList: [],
            selectedDepartment: '',
            desCount:0,
            submitBtn:false
        }
    }


    componentDidMount = () => {
        this.getDepartmentList()
    }
    getDepartmentList = () => {
        var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
        var url = UrlConstant.departmentDList + '?organisationId=' + organisatioId;
        var payload = ''
        GenericApiService.Post(url, payload).then((response) => {

            this.setState({
                departmentList: response.data
            })

        })
    }
    onCancel = () => {
        this.props.onCancel()
    }
    addDesignation = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                
                var departmentObj = this.state.departmentList[values.department];
                var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
                var userId = EncryptDecryptSessionStorageService.getSessionStorage('userId');
                var url = UrlConstant.saveDesignation;
                var payload = {
                    "name": values.designationName,
                    "organisationId": organisatioId,
                    "createdBy": userId,
                    "updatedBy": userId,
                    "description": values.description,
                    "isActive": true,
                    "department": {
                        "departmentId": departmentObj.departmentId
                    }
                }
                this.setState({
                    submitBtn:true
                });
                GenericApiService.Post(url, payload,true).then((response) => {
                    this.props.onOk();
                    this.setState({
                        submitBtn:false
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
    count(e){
        var val=e.target.value.length
        this.setState({
            desCount:val
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
                        title="Create Designation"
                        onCancel={this.onCancel}
                        onOk={this.addDesignation}
                        // okText="Save"
                        centered
                        keyboard={false}
                        footer={[
                            <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                                Cancel
                            </Button>,
                            <Button key="submit" shape="round" type="primary"
                             onClick={this.addDesignation}
                             loading={this.state.submitBtn}
                            disabled={hasErrors(getFieldsError())}>
                                Add
                            </Button>,
                            ]}
                        >
                        
                            <Form hideRequiredMark onSubmit={this.handleSubmit}>
                                
                                <Form.Item label="Department">
                                    {getFieldDecorator('department', {

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
                                        rules: [{ required: true, message: 'Please enter designation' },
                                        ],
                                    })(
                                        <Input id="designation-name" maxLength={30} />
                                    )}

                                </FormItem>
                            
                                <FormItem label="Description">
                                    {getFieldDecorator('description', {
                                        rules: [{ required: false },
                                        ],
                                    })(
                                        <Input id="designation-description"  maxLength={30}onChange={this.count.bind(this)} />
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
const WrappedAddDesignationForm = Form.create({ name: 'addDesignation' })(CreateDesignation);

export default WrappedAddDesignationForm;
