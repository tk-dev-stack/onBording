import React from 'react'

import {
    Form,
    Modal, Input, Checkbox, Button, Upload, Icon, message
} from 'antd'
import { GenericApiService } from '../../Utils/GenericService';
import { EncryptDecryptSessionStorageService } from '../../Utils/EncryptDecryptSessionStorageService';
import UrlConstant from '../../Utils/UrlConstant';
const { Dragger } = Upload;
function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

class EmployeeBulkUpload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            disableUpload: false,
            file: [],
            checkFileListLength: true
        }
        this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId');
        this.userId = EncryptDecryptSessionStorageService.getSessionStorage('userId');
    }
    onCancel = () => {
        this.props.onCancel()
    }


    onUploadChange = (info) => {


        let that = this


        if (info.file.type === 'text/csv') {




            // if (info.file.status === 'uploading') {
            //     that.setState({ loading: true });
            //     return;
            // }
            // if (info.file.status === 'done') {


            //     if (info.fileList.length > 1) {
            //         var newFileList = info.fileList
            //         newFileList.splice(0, newFileList.length - 1);


            //         that.setState({
            //             file: info.fileList
            //         })



            //     } else {




            //         that.setState({
            //             file: info.fileList
            //         })
            //     }

            // }
            if (info.fileList.length > 1) {
                var newFileList = info.fileList
                newFileList.splice(0, newFileList.length - 1);
                that.setState({
                    file: info.fileList
                })

            } else {
                that.setState({
                    file: info.fileList
                })
            }
            if (info.file.status === 'removed') {
                var fileList = info.fileList



                that.setState({
                    file: fileList
                })


            }
        } else {

            var newFileList = info.fileList
            newFileList.splice(
                newFileList.findIndex(v => v === info.file),
                1)


            that.setState({
                file: newFileList
            })




        }

        if (this.state.file.length === 0) {
            this.setState({
                checkFileListLength: true
            })
        }
        else {
            this.setState({
                checkFileListLength: false
            })
        }

    }
    beforeUpload = (file) => {


        const isJpgOrPng = file.type === 'text/csv';
        if (!isJpgOrPng) {
            message.error('You can only upload CSV')
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('Image must smaller than 2MB!');
        }
        return isJpgOrPng && isLt2M;
    }

    saveBulkUplaod = () => {
        var url = UrlConstant.empbulkUpload + "organisationId=" + this.orgId

        var formData = new FormData();

        if (this.state.file !== null || this.state.file !== undefined) {
            formData.append('file', this.state.file[0].originFileObj);
        }
        GenericApiService.saveformdata(url, formData, true).then((response) => {
            if (response.data.length !== 0 && response.status.success == 'Success') {
                this.props.onOk();
            }
        }).catch(function (err) {
            return console.log(err);
        });
    }
    render() {
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const { imageUrl } = this.state;
        const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form

        function hasErrors(fieldsError) {
            return Object.keys(fieldsError).some(field => fieldsError[field])
        }

        return (
            <div >
                <Form>
                    <Modal className="upload-modal"
                        visible={this.props.showHidePopup}
                        title="Upload Employees"
                        onCancel={this.onCancel}
                        onOk={this.save}
                        // okText="Save"
                        centered
                        keyboard={false}
                        footer={[
                            <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                                Cancel
                            </Button>,
                            <Button key="submit" shape="round" type="primary" onClick={this.saveBulkUplaod}
                                disabled={this.state.checkFileListLength}>
                                Add
                            </Button>,
                        ]}

                    >
                        <div className="col-sm-12">
                            <Dragger

                                listType="picture"

                                multiple={false}
                                // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                                beforeUpload={this.beforeUpload}
                                onChange={this.onUploadChange}
                            >
                                <p className="ant-upload-drag-icon mb-0">
                                    <Icon type="cloud-upload" /> <span className="d-inline-block ml-2">Browse Files</span>
                                </p>

                            </Dragger>


                            <a style={{ position: 'absolute', right: 10, margin: 5 }} href="https://onboarding.cloudnowtech.net/core/api/v1/hrm/employee/sampleCsvdownload">Download a Sample </a>




                        </div>

                    </Modal>
                </Form>
            </div>

        )
    }
}
const WrappedBulkUploadForm = Form.create({ name: 'EmployeeBulkUpload' })(EmployeeBulkUpload);

export default WrappedBulkUploadForm;
