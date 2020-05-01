import React from 'react'

import {
    Form,
    Icon,
    Modal,
    Upload,
    message,
    Button,
    Select
} from 'antd'
import { GenericApiService } from '../../../Utils/GenericService';
import UrlConstant from '../../../Utils/UrlConstant';
import { EncryptDecryptSessionStorageService } from '../../../Utils/EncryptDecryptSessionStorageService';
const { Dragger } = Upload;
const Option = Select.Option;

class AddFile extends React.Component {
    constructor(props) {
        super(props)
        this.state = {

            file: [],
            checkFileListLength: true,
            documentTypeList: [],
            submitBtn: false
        }
    }

    componentDidMount = () => {
        this.getDocumentTypeList();
    }

    getDocumentTypeList = () => {
        GenericApiService.GetAll(UrlConstant.getDocumentTypeUrl, false)
            .then(
                (response) => {
                    console.log(response);
                    this.setState({
                        documentTypeList: response.data
                    })
                }).catch((error) => {
                    return console.log(error);

                })
    }

    onCancel = () => {
        this.props.onCancel()
    }
    addDocument = (e) => {
        e.preventDefault();
        var { namelist, nameset } = this.preventDuplicateFile();
        if (namelist.length == nameset.size) {
            const uniqueFile = this.checKDuplicateFilesInList(nameset);
            if (uniqueFile == true) {
                this.props.form.validateFields(['documentTypeId', 'documentFile'], (err, values) => {
                    if (!err && this.state.file != 0) {
                        var payload = {
                            organisationId: this.props.data.orgId,
                            documentTypeMaster: { documentTypeId: values.documentTypeId },
                            createdBy: +EncryptDecryptSessionStorageService.getSessionStorage('userId'),
                            updatedBy: +EncryptDecryptSessionStorageService.getSessionStorage('userId'),
                            employeeId: parseInt(this.props.data.empId),
                        };
                        var formData = new FormData();
                        formData.append('documentDetailWrapper', JSON.stringify(payload));
                        for (let multiFile of this.state.file) {
                            formData.append('files', multiFile.originFileObj);
                        }
                        this.setState({
                            submitBtn: true
                        });

                        GenericApiService.saveformdata(UrlConstant.saveDocumentDetail, formData, true)
                            .then((response) => {
                                this.setState({
                                    submitBtn: false
                                });
                                if (response.data.length !== 0 && response.status.success == 'Success') {
                                    this.props.onOk();
                                }
                            }).catch((err) => {
                                this.setState({
                                    submitBtn: false
                                });
                                return console.log(err);
                            });
                    }
                })
            }
            else {
                message.error(`${uniqueFile} is already exist`);
            }
        } else {
            message.error('Duplicate files are not allowed');
        }
    }

    preventDuplicateFile = () => {
        var namelist = [];
        var nameset = new Set();
        for (let multiFile of this.state.file) {
            namelist.push(multiFile.name);
        }
        for (let multiFile of this.state.file) {
            nameset.add(multiFile.name);
        }
        return { namelist, nameset };
    }

    checKDuplicateFilesInList = (nameset) => {
        if (this.props.data.documentList.length != 0) {
            var oldNameSet = [];
            for (let multiFile of this.props.data.documentList) {
                oldNameSet.push(multiFile.name);
            }
            for (let name of nameset) {
                if (oldNameSet.includes(name)) {
                    return name;
                }
            }
            return true;
        }
        else {
            return true;
        }
    }

    beforeUpload = (file) => {


        const isJpgOrPng = file.type === 'image/jpeg'
            || file.type === 'image/png'
            || file.type === 'image/jpg'
            || file.type === 'application/pdf';

        const fileName = file.name.length <= 50 ? true : false;

        if (!isJpgOrPng || !fileName) {
            this.setState({

            })
            message.error(fileName ? 'You can only upload JPG/PNG/JPEG/PDF file!' : 'File Name should be less than 50 characters', 5);
        }
        // const isLt2M = file.size / 1024 / 1024 < 2;
        // if (!isLt2M) {
        //     message.error('Image must smaller than 2MB!');
        // }
        // return isJpgOrPng && isLt2M;

        return (fileName && isJpgOrPng);
    }
    onUploadChange = (info) => {


        let that = this;
        const fileType = info.file.type === 'image/jpeg'
            || info.file.type === 'image/png'
            || info.file.type === 'image/jpg'
            || info.file.type === 'application/pdf';
        const fileName = info.file.name.length <= 50 ? true : false;
        if (fileType && fileName) {

            // if (info.file.status === 'uploading') {
            //     that.setState({ loading: true });
            //     return;
            // }
            // if (info.file.status === 'done') {

            //     that.setState({
            //         file: info.fileList
            //     })

            // }
            setTimeout(() => {
                that.setState({
                    file: info.fileList
                })
                info.file.status = 'done';
            }, 2000);

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

    hasErrors = (fieldsError) => {
        return Object.keys(fieldsError).some(field => fieldsError[field])
    }
    render() {
        const { getFieldDecorator, getFieldsError } = this.props.form;
        return (
            <div >

                <Modal className="upload-modal"
                    visible={this.props.showHidePopup}
                    title="Upload Document"
                    fileList={this.state.fileList}
                    onCancel={this.onCancel}
                    onOk={this.addDocument}
                    centered
                    // okText="Save"
                    keyboard={false}
                    footer={[
                        <Button className="cancel-btn" key="back" shape="round" onClick={this.onCancel}>
                            Cancel
                            </Button>,
                        <Button key="submit" shape="round" type="primary"
                            onClick={this.addDocument}
                            loading={this.state.submitBtn}>
                            {/* disabled={hasErrors(getFieldsError())} */}
                            Upload
                            </Button>,
                    ]}
                    okButtonProps={
                        this.state.checkFileListLength === true ? { disabled: false } : { disabled: true }
                    }>
                    <Form>
                        <div className="form-container">
                            <Form.Item label="Document Type">
                                {getFieldDecorator('documentTypeId', {
                                    rules: [{ required: true, message: 'Please select document type' },
                                    ],
                                })(
                                    <Select id="documentTypeId"
                                        optionFilterProp="children"
                                        showSearch
                                        filterOption={(input, option) =>
                                            option.props.children
                                                .toLowerCase()
                                                .indexOf(input.toLowerCase()) >= 0
                                        }>
                                        {this.state.documentTypeList.map((e, key) => {
                                            return (
                                                <Option key={key} value={e.documentTypeId}>{e.name}</Option>
                                            )
                                        })
                                        }

                                    </Select>
                                )}
                            </Form.Item>
                        </div>
                        <Form.Item>
                            {getFieldDecorator('documentFile', {
                                rules: [{ required: true, message: 'Please select document file' },
                                ],
                            })(
                                <Dragger
                                    id="documentFile"
                                    multiple={true}
                                    name='file'
                                    //fileList={this.state.file}
                                    //  action='https://www.mocky.io/v2/5cc8019d300000980a055e76'
                                    listType='picture'
                                    beforeUpload={this.beforeUpload}
                                    onChange={this.onUploadChange}>
                                    <p className="ant-upload-drag-icon">
                                        <Icon type="cloud-upload" /> <span className="d-inline-block ml-2">Browse Files</span>
                                    </p>
                                    <p className="ant-upload-hint">
                                        Drag & drop or browse for multiple files.
                            </p>
                                    <p className="ant-upload-hint">
                                        Only JPG, PDF and PNG files. 2 MB max file size
                            </p>
                                </Dragger>)}
                        </Form.Item>
                    </Form>
                </Modal>
            </div>

        )
    }
}
const WrappedAddFileForm = Form.create({ name: 'addUser' })(AddFile);

export default WrappedAddFileForm;
