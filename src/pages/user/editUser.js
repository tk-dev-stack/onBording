import React from 'react'
import {
    Input,
    Form,
    Modal,
    Select,
    Button,
    Checkbox

} from 'antd'
import UrlConstant from '../../Utils/UrlConstant';
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService'
import { GenericApiService } from '../../Utils/GenericService';
const Option = Select.Option;

const FormItem = Form.Item
class EditUser extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            employeeList: [],
            roleList: [],
            selectedUserName: '',
            roleId: '',
            user: {},
            subminBtn:false
        }
    }





    componentDidMount = () => {
        this.getRoleDList();
        this.getuserById()
    }


    getRoleDList = () => {
        var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')

        var url = UrlConstant.getRoleDList + organisatioId
        var payload = ''
        GenericApiService.Post(url, payload).then((response) => {

            this.setState({
                roleList: response.data
            })
        })

    }
    onCancel = () => {
        this.props.onCancel()
    }
    editUserSave = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                var userId = EncryptDecryptSessionStorageService.getSessionStorage('userId')
                var organisatioId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
                var url = UrlConstant.addUser
                var payload = {
                    "userId": this.props.userdata.userId,
                    "name": values.username,
                    "email": this.props.userdata.email,

                    "organisationId": organisatioId,
                    "employeeId": this.props.userdata.employeeId,
                    "createdBy": userId,
                    "updatedBy": userId,
                    "createdOn": new Date(),
                    "updatedOn": new Date(),
                    "isActive": true,
                    "role": { "roleId": values.role },
                    //"isNotifyAssetMail": this.state.user.isNotifyAssetMail
                }
                      this.setState({
                        subminBtn:true
                      });
                GenericApiService.Post(url, payload, true).then((response) => {
                    this.setState({
                        subminBtn:false
                      })
                    if (response.status.success === 'Success') {
                        this.props.onOk()
                    }

                },error=>{
                    this.setState({
                        subminBtn:false
                      })
                })

            }
        })


    }
    onSelectRole = (e) => {
        this.setState({
            roleId: e
        })

    }
    getuserById() {
        GenericApiService.Post(UrlConstant.getUserById, { 'userId': this.props.userdata.userId }, false).then((response) => {
            if (response.data.length !== 0 && response.status.success === 'Success') {
                this.setState({
                    user: response.data
                });
            }
        }).catch(function (err) {
            return console.log(err);
        });
    }

    // onCheckboxClick(event) {
    //     var user=this.state.user;
    //     user.isNotifyAssetMail=event.target.checked;
    //     this.setState({
    //         user: user
    //     });
        
    // }
    render() {
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form

        function hasErrors(fieldsError) {
            return Object.keys(fieldsError).some(field => fieldsError[field])
        }

        return (
            <div >
                {this.state.user !== undefined ?
                    <Form>

                        <Modal className="role"
                            visible={this.props.showHidePopup}
                            title="Edit User"
                            onCancel={this.onCancel}
                            onOk={this.editUserSave}
                            centered
                            keyboard={false}
                            footer={[
                                <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                                    Cancel
                            </Button>,
                                <Button key="submit" shape="round" type="primary"
                                 onClick={this.editUserSave}
                                 loading={this.state.subminBtn}
                                    disabled={hasErrors(getFieldsError())}>
                                    Update
                            </Button>,
                            ]}

                        >
                            <Form hideRequiredMark onSubmit={this.handleSubmit}>
                                <Form.Item label="Email ID">
                                    {getFieldDecorator('employee', {
                                        initialValue: this.state.user.email,
                                        rules: [{ required: true, message: 'Please  select email Id' },
                                        ],
                                    })(
                                        <Input id='employee' disabled={true} />
                                    )}
                                </Form.Item>

                                <FormItem label="User Name">
                                    {getFieldDecorator('username', {
                                        initialValue: this.state.user.name,
                                        rules: [{ required: true, message: 'Please enter  user name' },
                                        ],
                                    })(
                                        <Input id="user-name" />
                                    )}

                                </FormItem>
                                <Form.Item label="Role">
                                    {getFieldDecorator('role', {
                                        initialValue: this.state.user.role !== undefined ? this.state.user.role.roleId : null,
                                        rules: [{ required: true, message: 'Please  select role' },
                                        ],
                                    })(
                                        <Select id="role" style={{ width: '100%' }}
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                option.props.children
                                                    .toLowerCase()
                                                    .indexOf(input.toLowerCase()) >= 0
                                            } onChange={this.onSelectRole.bind(this)}>
                                            {this.state.roleList.map((role, index) => {
                                                return (
                                                    <Option key={index} value={role.roleId}>{role.name}</Option>
                                                )
                                            }
                                            )}
                                        </Select>
                                    )}
                                </Form.Item>
                                {/* <Form.Item>
                                    {getFieldDecorator("isNotifyAssetMail", {

                                    })(
                                        <Checkbox checked={this.state.user.isNotifyAssetMail} onChange={this.onCheckboxClick.bind(this)}>
                                            Notify Asset Mails
                                     </Checkbox>
                                    )}
                                </Form.Item> */}
                            </Form>

                        </Modal>
                    </Form> : null}
            </div>

        )
    }
}
const WrappedEditUserForm = Form.create({ name: 'editUser' })(EditUser);

export default WrappedEditUserForm;
