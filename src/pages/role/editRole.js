import React from 'react'

import {
    Checkbox,
    Input,
    Form,
    Modal,
    Button
} from 'antd'
import UrlConstant from "../../Utils/UrlConstant";
import { GenericApiService } from "../../Utils/GenericService";

import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'

class EditRole extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            roleComponents: [],
            desCount: 0,
            subminBtn:false
        }
    }
    componentDidMount() {
        this.getRoleComponents();
        if (this.props.roleData.description != undefined) {
            this.setState({ desCount: this.props.roleData.description.length })
        }
    }
    getRoleComponents = () => {
        var url = UrlConstant.getRoleComponents
        var payload = ''
        GenericApiService.Post(url, payload).then((response) => {
            var roledata = this.props.roleData.rolePermissions


            if (roledata.length === 0) {

                var roleComponents = response.data
                for (let roleComponent of roleComponents) {

                    roleComponent.isCreate = false
                    roleComponent.isView = false
                    roleComponent.isEdit = false
                    roleComponent.isDelete = false

                }

            } else {
                var roleComponents = response.data
                for (let roleComponent of roleComponents) {
                    for (let rolePermission of roledata) {

                        if (roleComponent.componentId === rolePermission.componentId) {

                            roleComponent.isCreate = rolePermission.isCreate
                            roleComponent.isView = rolePermission.isView
                            roleComponent.isEdit = rolePermission.isEdit
                            roleComponent.isDelete = rolePermission.isDelete
                            roleComponent.rolePermissionId = rolePermission.rolePermissionId


                            break
                        }
                        else {

                            roleComponent.isCreate = false
                            roleComponent.isView = false
                            roleComponent.isEdit = false
                            roleComponent.isDelete = false

                        }

                    }

                }
            }
            this.setState({
                roleComponents: roleComponents
            })


        })

    }

    onCancel = () => {
        this.props.onCancel()
    }



    onViewClick = (component, index) => {


        var roleComponents = this.state.roleComponents

        var isview = roleComponents[index].isView;

        roleComponents[index].isView = !isview
        this.setState({
            roleComponents: roleComponents
        })

    }
    onCreateClick = (component, index) => {
        var roleComponents = this.state.roleComponents
        var iscreate = roleComponents[index].isCreate;

        roleComponents[index].isCreate = !iscreate
        this.setState({
            roleComponents: roleComponents
        })

    }
    onEditClick = (component, index) => {
        var roleComponents = this.state.roleComponents

        var isedit = roleComponents[index].isEdit;

        roleComponents[index].isEdit = !isedit

        this.setState({
            roleComponents: roleComponents
        })
    }
    onDeleteClick = (component, index) => {
        var roleComponents = this.state.roleComponents

        var isdelete = roleComponents[index].isDelete;

        roleComponents[index].isDelete = !isdelete
        this.setState({
            roleComponents: roleComponents
        })
    }

    updateRole = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                var userId = EncryptDecryptSessionStorageService.getSessionStorage('userId')
                var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
                var roleComponents = this.state.roleComponents
                var rolePermissions = []
                var role = {
                    roleId: this.props.roleData.roleId
                }

                for (let component of roleComponents) {
                    component.role = role
                    rolePermissions.push(component)
                }
                var url = UrlConstant.addRole
                var payload = {
                    "roleId": this.props.roleData.roleId,
                    "isActive": true,
                    "name": values.roleName,
                    "description": values.roleDescription,
                    "createdOn": new Date(),
                    "organisation": {
                        "organisatioId": organisatioId
                    },
                    "createdBy": userId,
                    "updatedBy": userId,
                    "rolePermissions": rolePermissions
                }
                    this.setState({
                        subminBtn:true
                    });
                GenericApiService.Post(url, payload, true).then((response) => {
                    this.setState({
                        subminBtn:false
                    });
                    if (response.status.success === 'Success') {

                        this.props.onOk()

                    }
                },error=>{
                    this.setState({
                        subminBtn:false
                    });
                })
            }
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
                        title="Edit Role"
                        onCancel={this.onCancel}
                        onOk={this.updateRole}
                        keyboard={false}
                        centered
                        footer={[
                            <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                                Cancel
                            </Button>,
                            <Button key="submit" shape="round"
                             type="primary" onClick={this.updateRole}
                             loading={this.state.subminBtn}
                                disabled={hasErrors(getFieldsError())}>
                                Update
                            </Button>,
                        ]}
                    >

                        <Form hideRequiredMark onSubmit={this.handleSubmit}>

                            <Form.Item label="Role">
                                {getFieldDecorator('roleName', {
                                    initialValue: this.props.roleData.name,
                                    rules: [{ required: true, message: 'Please enter role name' },
                                    ],
                                })(
                                    <Input id="role_name" maxLength={30} />
                                )}

                            </Form.Item>
                            <Form.Item label="Description">
                                {getFieldDecorator('roleDescription', {
                                    initialValue: this.props.roleData.description,
                                    rules: [{ required: true, message: 'Please enter role description' },
                                    ],
                                })(
                                    <Input id="role_descrption" maxLength={30} onChange={this.count.bind(this)} />
                                )}
                                <p style={{ float: 'right' }} >
                                    {this.state.desCount} /30
                                </p>
                            </Form.Item>
                            <div className="row comp-per">
                                <div className="col-lg-12">
                                    <h6>Component Permission </h6>
                                    <div className="row justify-content-end mb-2">
                                        <div className="col-7 checkbox-label">
                                            <span>View</span>
                                            <span>Create</span>
                                            <span>Edit</span>
                                            <span>Delete</span>
                                        </div>
                                    </div>
                                    {this.state.roleComponents.map((component, index) => {
                                        return (
                                            <div className="row align-items-center" key={index}>
                                                <div className="col-5 pr-0">
                                                    <label className="comp-name">{component.name} </label>
                                                </div>
                                                <div className="col-7">
                                                    <div className="row mx-0 mb-3">

                                                        <div className="col-3 p-0 text-center">
                                                            <Checkbox
                                                                name="View"
                                                                checked={component.isView}
                                                                onChange={this.onViewClick.bind(this, component, index)}
                                                            >


                                                            </Checkbox>
                                                        </div>
                                                        <div className="col-3 p-0 text-center">

                                                            <Checkbox
                                                                name="Create"
                                                                checked={component.isCreate}
                                                                onChange={this.onCreateClick.bind(this, component, index)}>


                                                            </Checkbox>
                                                        </div>
                                                        <div className="col-3 p-0 text-center">

                                                            <Checkbox
                                                                name="Edit"
                                                                checked={component.isEdit}
                                                                onChange={this.onEditClick.bind(this, component, index)}>


                                                            </Checkbox>
                                                        </div>
                                                        <div className="col-3 p-0 text-center">

                                                            <Checkbox
                                                                name="Delete"
                                                                checked={component.isDelete}
                                                                onChange={this.onDeleteClick.bind(this, component, index)}>


                                                            </Checkbox>
                                                        </div>


                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    )}
                                </div>
                            </div>


                        </Form>


                    </Modal>
                </Form>
            </div>

        )
    }
}
const WrappedEditRoleForm = Form.create({ name: 'editRole' })(EditRole);

export default WrappedEditRoleForm;
