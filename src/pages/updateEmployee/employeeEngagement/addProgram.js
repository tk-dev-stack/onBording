import React from 'react'
import {
    Input,
    DatePicker,
    Select,
    Form,
    Modal,
    Button
} from 'antd'
import { GenericApiService } from '../../../Utils/GenericService';
import UrlConstant from '../../../Utils/UrlConstant';
import { EncryptDecryptSessionStorageService } from '../../../Utils/EncryptDecryptSessionStorageService';
import moment from 'moment'
const Option = Select.Option;





class AddProgram extends React.Component {
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
            submitBtn: false,
            dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY'],

        }
        this.userId = EncryptDecryptSessionStorageService.getSessionStorage('userId');
        this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');

    }
    componentDidMount = () => {
        this.getStatusDL();
        this.getDepartmentDL();
        this.getEmployeeCategoryDL();
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
        })

    }

    onCancel = () => {
        this.props.onCancel();
    }
    addProgram = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    disableSave: true
                });
                var engagementCategoryDetails = this.state.categoryDL[values.engagementCategory]
                var payload =
                {
                    createdBy: parseInt(this.userId),
                    updatedBy: parseInt(this.userId),
                    updatedOn: new Date(),
                    createdOn: new Date(),
                    description: values.description,
                    endDate: values.endDate.format("YYYY-MM-DD"),
                    startDate: values.startDate.format("YYYY-MM-DD"),
                    isActive: true,
                    name: values.name,
                    organisationId: this.orgId,
                    status: { statusId: values.status },
                    employee: { employeeId: this.props.employeeId },
                    department: { departmentId: values.department },
                    engagementCategory: { engagementCategoryId: engagementCategoryDetails.id }
                }
                GenericApiService.Post(UrlConstant.saveEngagement, payload, true).then((response) => {
                    this.setState({
                        disableSave: false
                    });
                    if (response.data.length !== 0 && response.status.success == 'Success') {
                        this.props.onOk();
                    }
                    this.props.onOk();
                }).catch(function (err) {
                    return console.log(err);
                });
            }
        })

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
                this.setState({
                    submitBtn: true
                })
                var url = UrlConstant.saveEngagementCategory
                var payload = {
                    "name": values.otherEngagementCategory,
                    "organisationId": this.orgId,
                    "isActive": true
                }
                GenericApiService.Post(url, payload, true).then((response) => {
                    this.setState({
                        submitBtn: false,
                    })
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
        });
        console.log(this.state.ToDate_details);
    }

    disabledDate = current => {
        return current > this.state.ToDate_details;
        // this.state.ToDate_details ?  current > this.state.ToDate_details : current < moment().subtract(1, 'd')
        // Can not select days before today and today
  
    }

    disabledDate_To = current => {
        return current < this.state.FromDate_details;
        //  this.state.FromDate_details ? current < this.state.FromDate_details : current < moment().subtract(1, 'd')
    }
    cancelOtherEng = () => {
        this.setState({
            showOthersTextBox: false,
            disableSave: false
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

                <Modal className="role"
                    visible={this.props.showHidePopup}
                    title="Add Program"
                    onCancel={this.onCancel}
                    onOk={this.addProgram}
                    // okText="Save"
                    centered
                    keyboard={false}
                    footer={[
                        <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                            Cancel
                            </Button>,
                        <Button key="submit" shape="round" type="primary" onClick={this.addProgram}
                            loading={this.state.disableSave}
                            disabled={hasErrors(getFieldsError(['name', 'description', 'startDate',
                                'endDate', 'department', 'engagementCategory', 'status']))
                            }>
                            Add
                            </Button>,
                    ]}

                >

                    <Form hideRequiredMark onSubmit={this.handleSubmit}>
                        <Form.Item label="Program Name">
                            {getFieldDecorator('name', {
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
                                rules: [{ required: true, message: 'Please enter assign date' },
                                ],
                            })(
                                <DatePicker
                                    d="startDate"
                                    placeholder=""
                                    style={{ width: '100%' }}
                                    format={this.state.dateFormatList}
                                    disabledDate={this.disabledDate}
                                    onChange={this.FromDate} />
                            )}
                        </Form.Item>

                        <Form.Item label="End Date">
                            {getFieldDecorator('endDate', {
                                rules: [{ required: true, message: 'Please enter assign date' },
                                ],
                            })(
                                <DatePicker
                                    d="endDate"
                                    placeholder=""
                                    style={{ width: '100%' }}
                                    format={this.state.dateFormatList}
                                    disabledDate={this.disabledDate_To}
                                    onChange={this.ToDate} />
                            )}
                        </Form.Item>

                        <Form.Item label="Department">
                            {getFieldDecorator('department', {
                                rules: [{ required: true, message: 'Please  select department' },
                                ],
                            })(
                                <Select id="department"
                                    optionFilterProp="children"
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.props.children
                                            .toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }>
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

                                    disabled={hasErrors(getFieldsError(['otherEngagementCategory'])) || this.state.submitBtn == true}

                                    onClick={this.newEngCatgrySave}>Add</Button>


                            </div>


                        ) : (


                                <Form.Item label="Training Program">
                                    {getFieldDecorator('engagementCategory', {
                                        rules: [{ required: true, message: 'Please select training programy' },
                                        ],
                                    })(
                                        <Select id="category" style={{ width: '100%' }}
                                            onChange={this.onSelectEngCatgry}
                                            optionFilterProp="children"
                                            showSearch
                                            filterOption={(input, option) =>
                                                option.props.children
                                                    .toLowerCase()
                                                    .indexOf(input.toLowerCase()) >= 0
                                            }>
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
                                rules: [{ required: true, message: 'Please select assets status' },
                                ],
                            })(
                                <Select id="status"
                                    optionFilterProp="children"
                                    showSearch
                                    filterOption={(input, option) =>
                                        option.props.children
                                            .toLowerCase()
                                            .indexOf(input.toLowerCase()) >= 0
                                    }>
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

            </div>

        )
    }
}
const WrappedAddProgramForm = Form.create({ name: 'addProgram' })(AddProgram);

export default WrappedAddProgramForm;
