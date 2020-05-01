import React, { Component } from 'react'
import {
    Form,
    Modal,
    Icon, Spin
} from 'antd'
export class DocumentPreview extends Component {
    constructor(props) {
        super(props)

        this.state = {
            downloadDocument: '',
            onLoading: true,
        }

        this.bindActions();

    }

    bindActions() {
        this.updateIframeSrc = this.updateIframeSrc.bind(this);
        this.iframeLoaded = this.iframeLoaded.bind(this);
    }
    iframeLoaded() {
        this.setState({ onLoading: false })
        clearInterval(this.iframeTimeoutId);
    }
    getIframeLink() {
        return `https://docs.google.com/gview?url=${encodeURI(this.props.previewDocument)}&embedded=true`; // no need for this if thats not dynamic
    }
    updateIframeSrc() {
        var iframe = document.getElementById("iFrame");
        if (iframe != null) {
            iframe.src = iframe.src;
        }

    }
    componentDidMount() {

        this.iframeTimeoutId = setInterval(
            this.updateIframeSrc, 1000 * 3
        );
    }

    onCancel = () => {
        this.props.onCancel()
    }

    render() {
        return (
            <div>
                <Form>
                    <Modal className='letter'
                        visible={this.props.showHidePopup}
                        keyboard={false}
                        onCancel={this.onCancel}
                        footer={[
                            null,
                            null,
                        ]}

                    >
                        <a className="download-icon" href={this.props.previewDocument}>
                            {" "}<Icon type="download" />{" "}
                        </a>
                        {/* <h1>{this.state.onLoading?'True':'false'}</h1> */}
                        <Spin className="document-preview" spinning={this.state.onLoading} >
                            {this.props.previewDocument ?
                                (<>   <iframe id="iFrame" onLoad={this.iframeLoaded}
                                    onError={this.updateIframeSrc} className="document-preview"
                                    src={`https://docs.google.com/gview?url=${encodeURI(this.props.previewDocument)}&embedded=true`} >
                                </iframe>
                                </>) : null}
                        </Spin>

                    </Modal>
                </Form>
            </div>
        )
    }
}

const WrappedDocumentPreview = Form.create({ name: 'DocumentPreview' })(DocumentPreview);


export default WrappedDocumentPreview
