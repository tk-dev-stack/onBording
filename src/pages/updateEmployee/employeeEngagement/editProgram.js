import React from 'react'

import moment from 'moment'
import {
    Input,
    DatePicker,
    Select,
    Form,
    Modal,
    Button
} from 'antd';
import { GenericApiService } from '../../../Utils/GenericService';
import UrlConstant from '../../../Utils/UrlConstant';
import { EncryptDecryptSessionStorageService } from '../../../Utils/EncryptDecryptSessionStorageService';

const FormItem = Form.Item;
const { TextArea } = Input;
const Option = Select.Option;

class EditProgram extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            statusDL: [],
            departmentDL: [],
            categoryDL: [],
            showOthersTextBox: false,
            disableSave: false,
            FromDateValue: '',
            ToDateValue: '',
            desCount: 0,
            dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY'],

        }
        this.userId = EncryptDecryptSessionStorageService.getSessionStorage('userId');
        this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
    }
    count(e) {
        var val = e.target.value.length
        this.setState({
            desCount: val
        })
    }
    componentDidMount = () => {
        this.getStatusDL();
        this.getDepartmentDL();
        this.getEmployeeCategoryDL();
        if (this.props.editobj.description != undefined) {
            this.setState({ desCount: this.props.editobj.description.length })
        }
    }
    getDepartmentDL() {
        GenericApiService.Post(UrlConstant.departmentDList + '?organisationId=' + this.orgId, '', false).then((response) => {
            if (response.data.length !== 0 && response.status.success == 'Success') {
                this.setState({
                    departmentDL: response.data,
                });
            }
        }).catch(function (err) {
            return console.log(err);
        });
    }
    getStatusDL() {
        GenericApiService.GetAll(UrlConstant.statusList + '?statusCategory=engagement').then((response) => {
            if (response.data.length !== 0 && response.status.success == 'Success') {
                this.setState({
                    statusDL: response.data,
                });
            }
        }).catch(function (err) {
            return console.log(err);
        });
    }
    getEmployeeCategoryDL() {
        GenericApiService.Post(UrlConstant.employeecatagoryDL + '?organisationId=' + this.orgId, '', false).then((response) => {
            if (response.data.length !== 0 && response.status.success == 'Success') {
                this.setState({
                    categoryDL: response.data,
                });
            }
        }).catch(function (err) {
            return console.log(err);
        });
    }


    onCancel = () => {
        this.props.onCancel()
    }
    editProgram = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.updateEngagement(values)
            }
        });
    }

    //   disabledDate = current => {
    //     // Can not select days before today and today
    //     return (current && current > moment().endOf('day')) || current < moment().subtract(200, 'y')
    //   }

    updateEngagement(formValues) {
        console.log(formValues.category)

        var engagementCategoryDetails = this.state.categoryDL[formValues.category]
        console.log(engagementCategoryDetails)
        var requestPayload = this.props.editobj;

        requestPayload.status = {
            "statusId": formValues.status
        };

        requestPayload.employee = {
            "employeeId": requestPayload.employee.employeeId
        };
        if (requestPayload.engagementCategory.name === formValues.category) {
            requestPayload.engagementCategory = {
                "engagementCategoryId": requestPayload.engagementCategory.engagementCategoryId
            };
        } else {


            requestPayload.engagementCategory = {
                "engagementCategoryId": engagementCategoryDetails.id
            };
        }
        requestPayload.department = {
            "departmentId": requestPayload.department.departmentId
        };
        requestPayload.endDate = formValues.endDate.format("YYYY-MM-DD");
        requestPayload.startDate = formValues.startDate.format("YYYY-MM-DD");
        requestPayload.description = formValues.description;
        requestPayload.name = formValues.name;
        requestPayload.updatedOn = new Date();
        requestPayload.updatedBy = this.userId
        delete requestPayload.action;
        delete requestPayload.key;
        console.log(requestPayload);
        this.setState({
            disableSave: true
        })

        GenericApiService.Post(UrlConstant.saveEngagement, requestPayload, true).then((response) => {
            this.setState({
                disableSave: false
            });
            if (response.data.length !== 0 && response.status.success == 'Success') {
                this.props.onOk();
            }
        }, error => {
            this.setState({
                disableSave: false
            });
        });

    }


    onSelectEngCatgry = (e) => {


        var engCatryDetails = this.state.categoryDL[e]


        if (engCatryDetails.name === 'Others') {

            this.setState({
                showOthersTextBox: true,
                disableSave: true
            })

        }


    }
    newEngCatgrySave = () => {
        this.props.form.validateFields(['otherEngagementCategory'], (err, values) => {
            if (!err) {

                var url = UrlConstant.saveEngagementCategory
                var payload = {
                    "name": values.otherEngagementCategory,
                    "organisationId": this.orgId,
                    "isActive": true
                }
                GenericApiService.Post(url, payload, true).then((response) => {
                    if (response.status.success === 'Success') {
                        this.getEmployeeCategoryDL()
                        this.setState({
                            showOthersTextBox: false,
                            disableSave: false

                        })
                    }

                })




            }
        })

    }
    FromDate = (Date, datestring) => {
        this.setState({
            FromDate_details: Date,
            FromDateValue: datestring,
        })
    }
    ToDate = (Date, datestring) => {
        this.setState({
            ToDate_details: Date,
            ToDateValue: datestring,
        })
    }

    disabledDate = current => {
        return current > this.state.ToDate_details;
        // current > this.state.ToDate_details || current < moment().subtract(1, 'd');
    }

    disabledDate_To = current => {
        return current < this.state.FromDate_details;
        // ((current && current < this.state.FromDate_details) ||
        //     current < moment().subtract(1, 'd'))

    }
    cancelOtherEng = () => {
        this.setState({
            showOthersTextBox: false,
            disableSave: false
        })
    }
    render() {
        console.log(this.props.editobj.engagementCategory.engagementCategoryId)
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form

        function hasErrors(fieldsError) {
            return Object.keys(fieldsError).some(field => fieldsError[field])
        }

        return (
            <div >

                <Form>

                    <Modal className="role"
                        visible={this.props.showHidePopup}
                        title="Edit Program"
                        onCancel={this.onCancel}
                        onOk={this.editProgram}
                        // okText="Update"
                        centered
                        keyboard={false}
                        footer={[
                            <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                                Cancel
                            </Button>,
                            <Button key="submit" shape="round"
                                type="primary" onClick={this.editProgram}
                                loading={this.state.disableSave}
                                disabled={hasErrors(
                                    getFieldsError(
                                        ['name', 'description',
                                            'startDate', 'endDate',
                                            'department', 'engagementCategory',
                                            'status']))
                                }>
                                Update
                            </Button>,
                        ]}

                    >

                        <Form hideRequiredMark onSubmit={this.handleSubmit}>
                            <Form.Item label="Program Name">
                                {getFieldDecorator('name', {
                                    initialValue: this.props.editobj.name,
                                    rules: [{ required: true, message: 'Please  select program name' },
                                    ],
                                })(
                                    <Input id="name"
                                        key="name"
                                        type="text"
                                        maxLength={30} />
                                )}
                            </Form.Item>
                            <Form.Item label="Description">
                                {getFieldDecorator('description', {
                                    initialValue: this.props.editobj.description,
                                    rules: [{ required: true, message: 'Please enter description' },
                                    ],
                                })(
                                    <Input id="description"
                                        key="description"
                                        type="text"
                                        maxLength={30} onChange={this.count.bind(this)} />
                                )}
                            </Form.Item>
                            <div className="desc-width">
                                {this.state.desCount} /30
                            </div>

                            <Form.Item label="Start Date">
                                {getFieldDecorator('startDate', {
                                    initialValue: moment(this.props.editobj.startDate, 'DD-MM-YYYY'),
                                    rules: [{ required: true, message: 'Please enter assign date' },
                                    ],
                                })(
                                    <DatePicker
                                        d="startDate"
                                        placeholder=""
                                        style={{ width: '100%' }}
                                        format={this.state.dateFormatList}
                                        onChange={this.FromDate}
                                        disabledDate={this.disabledDate} />
                                )}
                            </Form.Item>

                            <Form.Item label="End Date">
                                {getFieldDecorator('endDate', {
                                    initialValue: moment(this.props.editobj.endDate, 'DD-MM-YYYY'),
                                    rules: [{ required: true, message: 'Please enter assign date' },
                                    ],
                                })(
                                    <DatePicker
                                        d="endDate"
                                        placeholder=""
                                        style={{ width: '100%' }}
                                        format={this.state.dateFormatList}
                                        onChange={this.ToDate}
                                        disabledDate={this.disabledDate_To} />
                                )}
                            </Form.Item>

                            <Form.Item label="Departments">
                                {getFieldDecorator('department', {
                                    initialValue: this.props.editobj.department.departmentId,
                                    rules: [{ required: true, message: 'Please  select department' },
                                    ],
                                })(
                                    <Select id="department">
                                        {this.state.departmentDL.map((e, key) => {
                                            return (
                                                <Option key={key} value={e.departmentId}>{e.departmentName}</Option>
                                            )
                                        })}

                                    </Select>
                                )}
                            </Form.Item>
                            {this.state.showOthersTextBox === true ? (

                                <div>

                                    <Form.Item label="Other Training Program">
                                        {getFieldDecorator('otherEngagementCategory', {

                                            rules: [{ required: true, message: 'Please enter other training program name' },
                                            ],
                                        })(
                                            <Input id="otherEngagementCategory" />
                                        )}

                                    </Form.Item>
                                    <Button
                                        key="back" shape="round" onClick={this.cancelOtherEng}>
                                        Cancel
                            </Button>
                                    <Button type='primary'

                                        disabled={hasErrors(getFieldsError(['otherEngagementCategory']))}

                                        onClick={this.newEngCatgrySave}>Add</Button>


                                </div>


                            ) : (


                                    <Form.Item label="Training Program">
                                        {getFieldDecorator('category', {
                                            initialValue: this.props.editobj.engagementCategory.name,
                                            rules: [{ required: true, message: 'Please  select training program' },
                                            ],
                                        })(
                                            <Select id="category"
                                                onChange={this.onSelectEngCatgry}>
                                                {this.state.categoryDL.map((e, key) => {
                                                    return (
                                                        <Option key={key} value={key}>{e.name}</Option>
                                                    )
                                                })}

                                            </Select>
                                        )}
                                    </Form.Item>
                                )}


                            <Form.Item label="Status">
                                {getFieldDecorator('status', {
                                    initialValue: this.props.editobj.status.statusId,
                                    rules: [{ required: true, message: 'Please  select assets status' },
                                    ],
                                })(
                                    <Select id="status">
                                        {this.state.statusDL.map((e, key) => {
                                            return (
                                                <Option key={key} value={e.statusId}>{e.name}</Option>
                                            )
                                        })}

                                    </Select>
                                )}
                            </Form.Item>
                        </Form>


                    </Modal>
                </Form>
            </div>

        )
    }
}
const WrappedEditProgramForm = Form.create({ name: 'editProgram' })(EditProgram);

export default WrappedEditProgramForm;
