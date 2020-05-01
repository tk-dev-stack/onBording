import React, { Component } from "react";
import { Button, Table, Input, Spin, Pagination } from 'antd'
import { GenericApiService } from "../../../Utils/GenericService";
import UrlConstant from "../../../Utils/UrlConstant";
import { EncryptDecryptSessionStorageService } from '../../../Utils/EncryptDecryptSessionStorageService'
import { commonService } from "../../../Utils/ConvertintoByteArray";
import moment from "moment";
import { DocumentPreview } from "../document/documentPreview";

const Search = Input.Search;
const columns = [
  {
    title: 'Asset Name',
    dataIndex: 'assetname',
    key: 'assetname',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Return Date',
    key: 'ReturnDate',

    dataIndex: 'returnDate'

  },
  {
    title: 'Status',
    key: 'status',
    dataIndex: 'status'

  },
];

class Deprovision extends Component {
  constructor(props) {
    super(props)
    this.orgId = EncryptDecryptSessionStorageService.getSessionStorage('orgId')
    this.state = {
      isAllProvisionCompleted: false,
      validEmpStatus: false,
      isDeprovisionStarted: false,
      disableStartDeprovisionButton: true,
      deprovisionList: [],
      loading: true,
      start: 0,
      limit: 10,
      search: '',
      provisionList: [],
      submitBtn: false,
      isTodayReleiving: false,
      previewUrl: '',
      submitExpDoc: false,
      submitRelDoc: false
    }
    this.onShowSizeChange = this.onShowSizeChange.bind(this)
    this.showTotal = this.showTotal.bind(this)
    this.onpagechange = this.onpagechange.bind(this)
    this.empId = this.props.tabObj.queryDetail.eid;
    this.userId = EncryptDecryptSessionStorageService.getSessionStorage('userId');
  }

  //on start deprovision btn click
  startDeprovision = () => {
    this.setState({
      submitBtn: true
    });
    GenericApiService.Post(UrlConstant.startDeprovision +
      '?employeeId=' + this.props.tabObj.queryDetail.eid +
      '&isDeprovisionStarted=true' + '&logginedUserId=' + this.userId, '', true)
      .then((response) => {
        this.setState({
          submitBtn: false
        });
        if (response.status.success == 'Success') {
          this.getEmployeeById();
        }
      }).catch(() => {
        this.setState({
          submitBtn: false
        });
      })
  }

  refresh = () => {
    this.getEmployeeById();
  };
  //get employee by id
  getEmployeeById() {
    GenericApiService.Post(UrlConstant.employeeById + '?employeeId=' + this.props.tabObj.queryDetail.eid, '', false).then((response) => {
      if (response.status.success == 'Success') {
        this.setState({
          provisionList: response.data.provisionList
        })

        //checking whether a employee started deprovision
        if (response.data.employee.isDeprovisionStarted !== null) {
          this.setState({
            isDeprovisionStarted: response.data.employee.isDeprovisionStarted,
            loading: false
          });
        }
        else {
          this.setState({
            isDeprovisionStarted: false,
            loading: false
          });
        }
        //checking whether all provision list is in completed status to start deprovision
        if (response.data.provisionList.length != 0) {
          var isAllProvisionCompleted = response.data.provisionList.every(e => e.provisionStatus.name == 'Completed');
          this.setState({
            isAllProvisionCompleted: isAllProvisionCompleted
          })
        }
        //checking today is releiving date or not...relievingDate
        var relievingDate = response.data.employee.relievingDate;
        relievingDate = new Date(relievingDate);
        relievingDate.setHours(0, 0, 0, 0)
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (relievingDate.getTime() == today.getTime()) {
          this.setState({
            isTodayReleiving: true
          })
        }
        else {
          this.setState({
            isTodayReleiving: false
          })
        }

        //checking employee status (notice or terminated) to  start deprovision
        if (response.data.employee.status.name == 'Notice Period' ||
          response.data.employee.status.name == 'Termination' ||
          response.data.employee.status.name == 'Relieved') {

          this.setState({
            validEmpStatus: true
          })
        }
        if (this.state.isAllProvisionCompleted == true && this.state.validEmpStatus === true) {
          this.setState({ disableStartDeprovisionButton: false }, () => console.log(this.state.disableStartDeprovisionButton))
        }
        else {
          this.setState({ disableStartDeprovisionButton: true })
        }
        var url = UrlConstant.getDeprovisionAssetList + 'start=' + this.state.start + '&limit=' + this.state.limit + '&organisationId=' + this.orgId + '&employeeId=' + this.empId + '&type=DEPROVISION'
        this.getDeprovisionList(url);
      }
    }).catch(function (err) {
      return console.log(err);
    });
  }

  componentDidMount = () => {
    this.getEmployeeById();
  }

  onSearch = (e) => {
    var empId = this.props.tabObj.queryDetail.eid;
    var searchValue = e.target.value
    this.setState({
      search: searchValue
    })
    var url = UrlConstant.getDeprovisionAssetList + 'start=' + this.state.start + '&limit=' + this.state.limit + '&organisationId=' + this.orgId + '&employeeId=' + this.empId + '&search=' + this.state.search + '&type=DEPROVISION'
    this.getDeprovisionList(url);
  }

  getDeprovisionList = (url, payload) => {
    var cloneUserList = []



    GenericApiService.Post(url, '', false).then((response) => {
      if (response.data !== '' && response.data !== null) {

        this.setState({
          totalPagesCount: response.totalResult,
          loading: false
        })

        for (
          var Index = 0;
          Index < (response.data).length;
          Index++
        ) {
          response.data[Index].returnedDate = response.data[Index].returnedDate ?
            moment(response.data[Index].returnedDate).format("DD-MM-YYYY") : null;

          cloneUserList.push({
            key: Index,
            assetname: response.data[Index].name,
            description: (response.data[Index].description),
            returnDate: (response.data[Index].returnedDate),
            status: (response.data[Index].deprovisionStatus.name !== 'Good to relieve' ?
              <Button onClick={this.onChangeStatus.bind(this, response.data[Index])}>Yet to recieve</Button> : response.data[Index].deprovisionStatus.name)
          })

        }
      }
      this.setState({
        deprovisionList: cloneUserList,

      })
    })


  }
  onChangeStatus = (assetdata) => {

    var url = UrlConstant.saveAsset
    var payload = assetdata;
    const returnDate = assetdata.returnedDate;
    assetdata.returnedDate = assetdata.returnedDate ?
      returnDate.split("-").reverse().join("-") : null;

    payload.deprovisionStatus.name = 'Good to relieve';
    delete payload.deprovisionStatus.statusId;
    GenericApiService.Post(url, payload, true).then((response) => {
      if (response.status.success === 'Success') {
        //this.getDeprovisionList()
        this.getEmployeeById()
      }

    })


  }
  onShowSizeChange(current, pageSize) {
    var tempstart = (current - 1) * pageSize;
    this.setState({ loading: true })
    var url = UrlConstant.getDeprovisionAssetList + 'start=' + tempstart + '&limit=' + pageSize + '&organisationId=' + this.orgId + '&employeeId=' + this.empId
    this.getDeprovisionList(url)
  }

  showTotal = (total, range) => {
    return `Items per page ${range[0]} - ${range[1]} of ${total} `
  }
  onpagechange = (pgno, limit) => {
    var start = (pgno - 1) * limit;
    this.setState({ loading: true })
    var url = UrlConstant.getDeprovisionAssetList + 'start=' + start + '&limit=' + limit + '&organisationId=' + this.orgId + '&employeeId=' + this.empId
    this.getDeprovisionList(url)
  }

  openDocumentPreview = (code) => {

    // const expcode = UrlConstant.experinceLetterCode;
    const relecode = UrlConstant.releivingLetterCode == code;
    var empId = this.props.tabObj.queryDetail.eid;

    var url = `${UrlConstant.autoUploadDocument + empId}&documentCode=${code}`
    var payload = this.dummyPDF_file();
    this.setState({
      [relecode ? 'submitRelDoc' : 'submitExpDoc']: true
    });
    GenericApiService.saveformdata(url, payload, false).then((response) => {
      if (response.status.success === 'Success') {
        const docId = response.data[0].documentDetailId;
        const url = UrlConstant.documentPreviewUrl + docId;
        GenericApiService.GetAll(url, false).then(resp => {
          if (resp.data.documentPreviewPath) {
            this.setState({
              documentObject: resp.data.documentPreviewPath,
              documentPreview: true,
              [relecode ? 'submitRelDoc' : 'submitExpDoc']: false

            })
          }
        });
      } else {
        this.setState({
          [relecode ? 'submitRelDoc' : 'submitExpDoc']: false
        })
      }
    }).catch(error => {
      this.setState({
        [relecode ? 'submitRelDoc' : 'submitExpDoc']: false
      })
    })

  }

  dismissPreview = () => {
    this.setState({
      documentPreview: false
    })
  }

  dummyPDF_file() {
    var file = new FormData();
    var pdf = new File([" "], "filename.pdf", {
      type: "text/plain",
      lastModified: new Date()
    });
    file.append("files", pdf);
    var payload = file;
    return payload;
  }



  render() {
    return (

      <Spin spinning={this.state.loading} delay={500}>
        {this.state.documentPreview ? (
          <DocumentPreview
            showHidePopup={this.state.documentPreview}
            previewDocument={this.state.documentObject}
            onCancel={this.dismissPreview}
            empId={this.props.tabObj.queryDetail.eid}
          />
        ) : null}

        <div>

          {this.state.isDeprovisionStarted === false ? (
            this.state.provisionList.length > 0 ?

              <div className="text-center mt-0 mb-3">
                {this.state.isAllProvisionCompleted === true && this.state.validEmpStatus === true ?
                  <p>Deprovisioning process has not started yet.
               Would you like to start now?</p> :
                  <div>
                    <p> The following criteria's should be satisfied to start deprovisioning,</p>
                    <p>* Status of provisioning of all the assets should be completed.</p>
                    <p>* The status of the employee should be either "Under notice period" Or "Terminated" Or "Relieved".</p></div>}

                <Button type="primary" shape="round" loading={this.state.submitBtn} disabled={this.state.disableStartDeprovisionButton} onClick={this.startDeprovision} > Start Deprovisioning</Button>
              </div> : <div className="text-center mt-0">
                <p>Provisioning of assets is mandatory to start deprovisioning.</p>
              </div>
          ) : null}
          {this.state.validEmpStatus == true ? (
            <div>
              <div className="row search-row">
                <div className="col-lg-12">
                  <Search
                    placeholder="Search"
                    onChange={this.onSearch}
                    onKeyPress={e => {
                      commonService.removeFocus(this.refs, e);
                    }}
                    ref="input"
                  />
                  <Button
                    className="btn-with-icon mx-4"
                    type="secondary"
                    shape="round"
                    icon="file-text"
                    onClick={() => this.openDocumentPreview(UrlConstant.releivingLetterCode)}
                    loading={this.state.submitRelDoc}
                  >
                    Generate Relieving Letter
                  </Button>
                  <Button
                    loading={this.state.submitExpDoc}
                    className="btn-with-icon"
                    type="primary"
                    shape="round"
                    icon="file-text"
                    onClick={() => this.openDocumentPreview(UrlConstant.experinceLetterCode)}
                  >
                    Generate Experience Letter
                  </Button>
                </div>
              </div>
              <div className="row table-row">
                <div className="col-lg-12">
                  <div className="table-responsive">
                    <Table
                      columns={columns}
                      pagination={false}
                      dataSource={this.state.deprovisionList}
                    />
                  </div>
                </div>
              </div>
              <div className="row pagination-row">
                <div className="col-lg-12 text-right">
                  <Pagination
                    size="small"
                    total={this.state.totalPagesCount}
                    showSizeChanger
                    onShowSizeChange={this.onShowSizeChange}
                    showTotal={this.showTotal}
                    onChange={this.onpagechange}
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>


      </Spin>




    );
  }
}

export default Deprovision;
