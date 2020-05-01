


import React from 'react'
import {
    Input,
    Form,
    Modal,
    Select,
    Button,
    Icon,
    Divider,
    DatePicker

} from 'antd'
import UrlConstant from '../../../Utils/UrlConstant';
import { EncryptDecryptSessionStorageService } from '../../../Utils/EncryptDecryptSessionStorageService'
import { GenericApiService } from '../../../Utils/GenericService';
import { restElement, isDeclareVariable, } from '@babel/types';
import moment from 'moment'

const Option = Select.Option;

const FormItem = Form.Item
class AddAsstes extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            getAssetDList: [],
            addNewAsstePopup: false,
            assetname: '',
            assetStatusList: [],
            departmentDList: [],
            showOthersTextBox: false,
            disableSave: false,
            desCount: 0,
            dateFormatList: ['DD/MM/YYYY', 'DD/MM/YY']
        }
        this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
        this.userId = EncryptDecryptSessionStorageService.getSessionStorage('userId');
    }






    componentDidMount = () => {
        this.getAssetDList()
        this.getAssetStatusList()
        this.departmentDList()

    }
    getAssetDList = () => {
        var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
        var url = UrlConstant.getAssetDList + 'organisationId=' + organisatioId
        var payload = ''
        GenericApiService.GetAll(url, payload).then((response) => {
            if (response.data !== null && response.data !== '') {
                this.setState({
                    getAssetDList: response.data
                })

            }
        })

    }
    getAssetStatusList = () => {
        var url = UrlConstant.getAssetStatusList
        var payload = ''
        GenericApiService.GetAll(url, payload).then((response) => {
            if (response.data !== null && response.data !== '') {
                this.setState({
                    assetStatusList: response.data
                })

                var newAssetStatusList = this.state.assetStatusList
                for (let asset of newAssetStatusList) {
                    if (asset.name === "Pending") {
                        this.setState({
                            assetStatusId: asset.statusId
                        })

                    }
                }



            }

        })

    }
    departmentDList = () => {
        var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
        var url = UrlConstant.departmentDList + '?organisationId=' + organisatioId
        var payload = ''
        GenericApiService.Post(url, payload).then((response) => {

            if (response.data !== null && response.data !== '') {
                this.setState({
                    departmentDList: response.data
                })



            }

        })
    }
    onSelectAsset = (e) => {

        var assetDetails = this.state.getAssetDList[e]


        if (assetDetails.name === 'Others') {

            this.setState({
                showOthersTextBox: true,
                disableSave: true
            })

        }

    }
    cancelOtherAsset = () => {
        this.setState({
            showOthersTextBox: false,
            disableSave: false
        })
    }
    newAssetSave = () => {
        this.props.form.validateFields(['otherAssetName'], (err, values) => {
            // ...
            if (!err) {
                this.setState({
                    disableSave: true
                })
                var url = UrlConstant.saveAssetCategory
                var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
                var payload = {


                    "name": values.otherAssetName,
                    "organisationId": organisatioId,
                    "isActive": true

                }
                GenericApiService.Post(url, payload, true).then((response) => {
                    if (response.status.success === 'Success') {
                        this.getAssetDList()
                        this.setState({
                            showOthersTextBox: false,
                            disableSave: false
                        })
                    }
                })
            }
        })

    }
    addAssets = () => {
        this.props.form.validateFields(['assetName', 'description', 'assignDate', 'assetStatus', 'department'], (err, values) => {

            if (!err) {
                this.setState({
                    disableSave: true
                });

                var assetDetails = this.state.getAssetDList[values.assetName]

                var url = UrlConstant.saveAsset
                var payload = {
                    "name": assetDetails.name,
                    "description": values.description,
                    "assignedDate": moment(values.assignDate).format('YYYY-MM-DD'),
                    "createdBy": this.userId,
                    "updatedBy": this.userId,
                    "isActive": true,

                    "provisionStatus": {
                        "statusId": this.state.assetStatusId
                    },
                    "isDeprovision": false,
                    "deprovisionStatus": null,
                    "department": {
                        "departmentId": values.department
                    },
                    "organisationId": this.orgId,
                    "employee": {
                        "employeeId": this.props.empId
                    },
                    "assetCategory": {
                        "assetCategoryId": assetDetails.id
                    }

                }

                GenericApiService.Post(url, payload, true).then((response) => {
                    this.setState({
                        disableSave: false
                    })
                    if (response.status.success === 'Success') {
                        this.props.onOk()
                    }


                })
            }
        })

    }

    onCancel = () => {
        this.props.onCancel()
    }
    addNewAssetName = () => {

        this.setState({
            addNewAsstePopup: true,

        })



    }
    addAssetsNewSave = () => {
        this.setState({
            addNewAsstePopup: false
        })
    }
    addAssetNewCancel = () => {
        this.setState({
            addNewAsstePopup: false
        })
    }


    disabledDate = current => {
        return current < moment().subtract(1, 'd')
        // Can not select days before today and today
        // return current && current > moment().endOf('day')
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
                        title="Add Asset"
                        onCancel={this.onCancel}
                        onOk={this.addAssets}
                        // okText="Save"
                        centered
                        keyboard={false}
                        footer={[
                            <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                                Cancel
                            </Button>,
                            <Button key="submit" shape="round" type="primary" onClick={this.addAssets}
                                disabled={hasErrors(
                                    getFieldsError(['assetName', 'description', 'assignDate', 'assetStatus', 'department']))
                                    || this.state.disableSave}>
                                Save
                            </Button>,
                        ]}

                    >

                        <Form hideRequiredMark onSubmit={this.handleSubmit}>
                            {this.state.showOthersTextBox === true ? (
                                <div>
                                    <Form.Item label="Other Asset Name">
                                        {getFieldDecorator('otherAssetName', {

                                            rules: [{ required: true, message: 'Please enter asset name' },
                                            ],
                                        })(
                                            <Input id="otherAssetName" />
                                        )}

                                    </Form.Item>
                                    <Button
                                        key="back" className="mr-3 mb-4" shape="round" onClick={this.cancelOtherAsset}>
                                        Cancel
                                    </Button>
                                    <Button type='primary' shape="round"
                                        disabled={hasErrors(getFieldsError(['otherAssetName']) || this.setState.disableSave)} onClick={this.newAssetSave}>Save</Button>
                                </div>

                            ) : (
                                    <Form.Item label='Asset Name'>
                                        {getFieldDecorator('assetName', {

                                            rules: [{ required: true, message: 'Please  select asset name' },
                                            ],
                                        })(
                                            <Select
                                                id="assetName"
                                                onChange={this.onSelectAsset}
                                                showSearch
                                                filterOption={(input, option) =>
                                                    option.props.children
                                                        .toLowerCase()
                                                        .indexOf(input.toLowerCase()) >= 0
                                                }

                                            >
                                                {this.state.getAssetDList.map((asset, index) => {

                                                    return (
                                                        <Option key={index} value={index}>{asset.name}</Option>
                                                    )
                                                }
                                                )}



                                            </Select>
                                        )}
                                    </Form.Item>
                                )}
                            <Form.Item label="Description">
                                {getFieldDecorator('description', {

                                    rules: [{ required: true, message: 'Please enter description' },
                                    ],
                                })(
                                    <Input id="description" maxLength={100} onChange={this.count.bind(this)} />
                                )}

                            </Form.Item>
                            <div className="provison-desc-width">
                                {this.state.desCount} /100
                            </div>
                            <Form.Item label='Assign Date'>
                                {getFieldDecorator('assignDate', {

                                    rules: [{ required: true, message: 'Please select assign date' },
                                    ],
                                })(
                                    <DatePicker
                                        d="dob"
                                        style={{ width: '100%' }}
                                        placeholder=""
                                        format={this.state.dateFormatList}
                                        disabledDate={this.disabledDate}
                                    />
                                )}
                            </Form.Item>
                            <Form.Item label='Asset Status'>
                                {getFieldDecorator('assetStatus', {
                                    initialValue: "Pending",
                                    rules: [{ required: true, message: 'Please enter select assetStatus' },
                                    ],
                                })(
                                    <Select id="assetStatus"
                                        showSearch
                                        disabled={true}
                                        filterOption={(input, option) =>
                                            option.props.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >= 0
                                        }>
                                        {this.state.assetStatusList.map((status, index) => {
                                            return (
                                                <Option key={index} value={status.statusId}>{status.name}</Option>
                                            )
                                        }
                                        )}

                                    </Select>
                                )}
                            </Form.Item>

                            <Form.Item label='Department'>
                                {getFieldDecorator('department', {

                                    rules: [{ required: true, message: 'Please enter select department' },
                                    ],
                                })(
                                    <Select id="department"
                                        style={{ width: '100%' }}
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.props.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >= 0
                                        }>
                                        {this.state.departmentDList.map((department, index) => {
                                            return (
                                                <Option key={index} value={department.departmentId}>{department.departmentName}</Option>
                                            )
                                        }
                                        )}

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
const WrappedAddAssetsForm = Form.create({ name: 'AddAsstes' })(AddAsstes);

export default WrappedAddAssetsForm;
