import React, { Component } from "react";
import { Document, Page } from 'react-pdf';
class DeprovisionAssets extends Component {
    state = {
        numPages: null,
        pageNumber: 1,
        pdfshow: false
    }
    onDocumentLoadSuccess = ({ numPages }) => {
        this.setState({ numPages });
    }

    openPdf = () => {
        this.setState({
            pdfshow: true

        })
    }

    render() {
        const { pageNumber, numPages } = this.state;
        return (
            <div className="custom-card" style={{ textAlign: 'center' }}>
                DeprovisionAssets
      <h3 onClick={this.openPdf}>Generate pdf</h3>


                {this.state.pdfshow == true ? (
                    <div>
                        <Document
                            file="https://www.antennahouse.com/XSLsample/pdf/sample-link_1.pdf"
                            onLoadSuccess={this.onDocumentLoadSuccess}
                        >
                            <Page pageNumber={pageNumber} />
                        </Document>
                        <p>Page {pageNumber} of {numPages}</p>
                    </div>
                ) : null}
            </div>

        );
    }
}

export default DeprovisionAssets;
