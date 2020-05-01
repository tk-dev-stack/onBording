import React, { Component } from "react";
import { Form, Input, Button, InputNumber } from "antd";
import { Link } from "react-router-dom";
import { GenericApiService } from "../../../Utils/GenericService";
import UrlConstant from "../../../Utils/UrlConstant";
import { EncryptDecryptSessionStorageService } from "../../../Utils/EncryptDecryptSessionStorageService";
import Directives from "../../../Utils/directives";
import Documents from '../document/document';

class AddSalaryBreakUp extends Component {
    constructor(props) {
        super(props);

        this.state = {
            sumbitBtn: false,
            salaryId: "",
            sumbit_APL_Btn: false,
            AppLetter_Btn: true
        };

        this.orgId = EncryptDecryptSessionStorageService.getSessionStorage("orgId");
        this.userId = EncryptDecryptSessionStorageService.getSessionStorage("userId");
        this.empId = this.props.tabObj.queryDetail.eid;
    }

    componentDidMount() {
        this.checkTheEmployee();
    }

    checkTheEmployee() {
        if (this.props.tabObj.queryDetail.eid == "new") {
        } else {
            this.getEmployeeSalary(this.props.tabObj.queryDetail.eid);
            this.employeeId = this.props.tabObj.queryDetail.eid;
        }
    }

    

    getEmployeeSalary = eid => {

        GenericApiService.Post(UrlConstant.getEmployeeSalaryById + eid, "", false)
            .then(response => {
                console.log(response);
                var values = response.data;

                if (values) {
                    this.setState({
                        salaryId: response.data.instaCntEemployeeSsalaryDetailId,
                        name: values.name,
                        description: values.description,
                        cntOrganisationId: values.cntOrganisationId,
                        createdBy: values.createdBy,
                        instaCntDesignationId: values.instaCntDesignationId,
                        AppLetter_Btn: false
                    });
                    this.props.form.setFieldsValue({
                        basicSalaryMonthly: this.changeNumberToIndianCurrency(values.basicSalaryMonthly),
                        basicSalaryYearly: this.changeNumberToIndianCurrency(values.basicSalaryYearly),
                        dearnessAllowanceMonthly: this.changeNumberToIndianCurrency(values.dearnessAllowanceMonthly),
                        dearnessAllowanceYearly: this.changeNumberToIndianCurrency(values.dearnessAllowanceYearly),
                        houserentAllowanceMonthly: this.changeNumberToIndianCurrency(values.houserentAllowanceMonthly),
                        houserentAllowanceYearly: this.changeNumberToIndianCurrency(values.houserentAllowanceYearly),
                        grossSalaryMonthly: this.changeNumberToIndianCurrency(values.grossSalaryMonthly),
                        grossSalaryYearly: this.changeNumberToIndianCurrency(values.grossSalaryYearly),
                        pfEmployerMonthly: this.changeNumberToIndianCurrency(values.pfEmployerMonthly),
                        pfEmployerYearly: this.changeNumberToIndianCurrency(values.pfEmployerYearly),
                        esiEmployerMonthly: this.changeNumberToIndianCurrency(values.esiEmployerMonthly),
                        esiEmployerYearly: this.changeNumberToIndianCurrency(values.esiEmployerYearly),
                        pfEmployeeMonthly: this.changeNumberToIndianCurrency(values.pfEmployeeMonthly),
                        pfEmployeeYearly: this.changeNumberToIndianCurrency(values.pfEmployeeYearly),
                        esiEmployeeMonthly: this.changeNumberToIndianCurrency(values.esiEmployeeMonthly),
                        esiEmployeeYearly: this.changeNumberToIndianCurrency(values.esiEmployeeYearly),
                        ctcMonthly: this.changeNumberToIndianCurrency(values.ctcMonthly),
                        ctcYearly: this.changeNumberToIndianCurrency(values.ctcYearly),
                        totalMonthly: this.changeNumberToIndianCurrency(values.totalMonthly),
                        totalYearly: this.changeNumberToIndianCurrency(values.totalYearly),
                        netSalaryMonthly: this.changeNumberToIndianCurrency(values.netSalaryMonthly),
                        netSalaryYearly: this.changeNumberToIndianCurrency(values.netSalaryYearly),
                        cntOrganisationId: this.orgId,
                        isActive: true,
                        createdBy: values.createdBy,
                        updatedBy: parseInt(this.userId),
                        createdOn: values.createdOn,
                        updatedOn: this.date,
                        employeeId: values.employeeId
                    });
                } else {
                    GenericApiService.Post(
                        UrlConstant.employeeById +
                        "?employeeId=" +
                        this.props.tabObj.queryDetail.eid,
                        "",
                        false
                    ).then(response => {
                        console.log(response.data.employee.designation.designationId);
                        this.setState({
                            instaCntDesignationId:
                                response.data.employee.designation.designationId,
                            name:
                                response.data.employee.firstName +
                                " " +
                                response.data.employee.lastName,
                            description: response.data.employee.designation.description
                        });
                    });
                }
            })
            .catch(error => {
                console.log(error);
            });
    };
    // event.target.value.length<=7?event.target.value:event.target.value.slice(0,7)
    changeEventValueToCurrencyFormat(event) {
        var labelName = event.target.name;
        const input = event.target.value;
        var value = (input.includes(',') && input.length <= 9) ? input : event.target.value.slice(0, 7);
        if (value != null && value != undefined && value != "") {
            var number = parseInt(value.split(",").join(''))
            var formatted = number.toLocaleString('en-IN');
            this.props.form.setFieldsValue({
                [labelName]: formatted,
            });
        }

    }
    changeFormValuesToNumberFormat() {
        var value = this.props.form.getFieldsValue();
        for (let key in value) {
            if (value[key] != null) {
                value[key] = parseInt(value[key].toLocaleString().split(",").join(''))
            }

        }
        return value;
    }
    changeNumberToCurrencyFormat(properity, value) {
        var formatted = value.toLocaleString('en-IN');
        this.props.form.setFieldsValue({
            [properity]: formatted,
        });
    }

    changeNumberToIndianCurrency(numberValue) {
        return numberValue.toLocaleString('en-IN');
    }

    getTotalGrossSalary = event => {
        this.changeEventValueToCurrencyFormat(event);
        var value = this.changeFormValuesToNumberFormat();
        if (value) {
            //first block start
            if (value.basicSalaryMonthly) {
                var salValue = parseInt(12 * value.basicSalaryMonthly)
                this.changeNumberToCurrencyFormat('basicSalaryYearly', salValue)
            } else {
                this.props.form.setFieldsValue({
                    basicSalaryYearly: 0
                });
            }
            if (value.dearnessAllowanceMonthly) {
                var salValue = parseInt(12 * value.dearnessAllowanceMonthly)
                this.changeNumberToCurrencyFormat('dearnessAllowanceYearly', salValue)
            } else {
                this.props.form.setFieldsValue({
                    dearnessAllowanceYearly: 0
                });
            }

            if (value.houserentAllowanceMonthly) {
                var salValue = parseInt(12 * value.houserentAllowanceMonthly)
                this.changeNumberToCurrencyFormat('houserentAllowanceYearly', salValue)
            } else {
                this.props.form.setFieldsValue({
                    houserentAllowanceYearly: 0
                });
            }
            //first block end...
            //first block monthly sum.... 
            if (value.basicSalaryMonthly && value.dearnessAllowanceMonthly && value.houserentAllowanceMonthly) {

                var salValue1 = parseInt(
                    parseInt(value.basicSalaryMonthly) +
                    parseInt(value.dearnessAllowanceMonthly) +
                    parseInt(value.houserentAllowanceMonthly)
                )
                this.changeNumberToCurrencyFormat('grossSalaryMonthly', salValue1)
                var salValue2 = parseInt(
                    parseInt(value.basicSalaryMonthly * 12) +
                    parseInt(value.dearnessAllowanceMonthly * 12) +
                    parseInt(value.houserentAllowanceMonthly * 12)
                )
                this.changeNumberToCurrencyFormat('grossSalaryYearly', salValue2)
            } else {
                this.props.form.setFieldsValue({
                    grossSalaryMonthly: 0,
                    grossSalaryYearly: 0
                });
            }

            // 2nd block strat....
            if (value.pfEmployerMonthly) {
                var salValue = parseInt(12 * value.pfEmployerMonthly)
                this.changeNumberToCurrencyFormat('pfEmployerYearly', salValue)
            } else {
                this.props.form.setFieldsValue({
                    pfEmployerYearly: 0
                });
            }
            if (value.esiEmployerMonthly) {
                var salValue = parseInt(12 * value.esiEmployerMonthly)
                this.changeNumberToCurrencyFormat('esiEmployerYearly', salValue)
            } else {
                this.props.form.setFieldsValue({
                    esiEmployerYearly: 0
                });
            }
            //2nd block sum

            if (value.basicSalaryMonthly
                && value.dearnessAllowanceMonthly
                && value.houserentAllowanceMonthly
                && (value.esiEmployerMonthly || value.pfEmployerMonthly)) {
                var salValue1 = parseInt(
                    parseInt(value.basicSalaryMonthly) +
                    parseInt(value.dearnessAllowanceMonthly) +
                    parseInt(value.houserentAllowanceMonthly) +
                    parseInt(value.pfEmployerMonthly ? value.pfEmployerMonthly : 0) +
                    parseInt(value.esiEmployerMonthly ? value.esiEmployerMonthly : 0)
                )
                this.changeNumberToCurrencyFormat('ctcMonthly', salValue1)
                var salValue2 = parseInt((value.houserentAllowanceMonthly * 12)
                    + (value.dearnessAllowanceMonthly * 12)
                    + (value.basicSalaryMonthly * 12)
                    + ((value.pfEmployerMonthly ? value.pfEmployerMonthly : 0) * 12)
                    + ((value.esiEmployerMonthly ? value.esiEmployerMonthly : 0) * 12))
                this.changeNumberToCurrencyFormat('ctcYearly', salValue2)
            }
            else {
                this.props.form.setFieldsValue({
                    ctcMonthly: 0,
                    ctcYearly: 0
                });
            }

            //2nd block completed...


// 2nd Block 2nd Senario code 
if (value.basicSalaryMonthly
    && value.dearnessAllowanceMonthly
    && value.houserentAllowanceMonthly
    && (value.esiEmployerMonthly==0 && value.pfEmployerMonthly==0)) {
    var salValue1 = parseInt(
        parseInt(value.basicSalaryMonthly) +
        parseInt(value.dearnessAllowanceMonthly) +
        parseInt(value.houserentAllowanceMonthly) +
        parseInt(value.pfEmployerMonthly==0 ? value.pfEmployerMonthly : 0) +
        parseInt(value.esiEmployerMonthly==0 ? value.esiEmployerMonthly : 0)
    )
    this.changeNumberToCurrencyFormat('ctcMonthly', salValue1)
    var salValue2 = parseInt((value.houserentAllowanceMonthly * 12)
        + (value.dearnessAllowanceMonthly * 12)
        + (value.basicSalaryMonthly * 12)
        + ((value.pfEmployerMonthly==0 ? value.pfEmployerMonthly : 0) * 12)
        + ((value.esiEmployerMonthly==0 ? value.esiEmployerMonthly : 0) * 12))
    this.changeNumberToCurrencyFormat('ctcYearly', salValue2)
}





            //3rd block start...
            if (value.pfEmployeeMonthly) {
                var salValue = parseInt(value.pfEmployeeMonthly * 12)
                this.changeNumberToCurrencyFormat('pfEmployeeYearly', salValue)
            } else {
                this.props.form.setFieldsValue({
                    pfEmployeeYearly: 0
                })
            }
            if (value.esiEmployeeMonthly || value.pfEmployeeMonthly) {
                var salValue1 = parseInt(value.pfEmployeeMonthly ? value.pfEmployeeMonthly : 0) + parseInt(value.esiEmployeeMonthly)
                this.changeNumberToCurrencyFormat('totalMonthly', salValue1)
                var salValue2 = parseInt((value.pfEmployeeMonthly ? value.pfEmployeeMonthly : 0) * 12) + parseInt(value.esiEmployeeMonthly * 12)
                this.changeNumberToCurrencyFormat('totalYearly', salValue2)
            } else {
                this.props.form.setFieldsValue({
                    totalMonthly: 0,
                    totalYearly: 0
                });
            }
            if (value.esiEmployeeMonthly) {
                var salValue = parseInt(value.esiEmployeeMonthly * 12)
                this.changeNumberToCurrencyFormat('esiEmployeeYearly', salValue)

            } else {
                this.props.form.setFieldsValue({
                    esiEmployeeYearly: 0
                })
            }
            //3rd block end...
            //3rd block sum...
            if (value.basicSalaryMonthly
                && value.dearnessAllowanceMonthly
                && value.houserentAllowanceMonthly
                && (value.esiEmployerMonthly || value.pfEmployerMonthly)
                && (value.esiEmployeeMonthly || value.pfEmployeeMonthly)) {

                var salValue1 = (parseInt(
                    parseInt(value.basicSalaryMonthly) +
                    parseInt(value.dearnessAllowanceMonthly) +
                    parseInt(value.houserentAllowanceMonthly)
                ))
                    -
                    (parseInt(
                        parseInt(value.pfEmployeeMonthly ? value.pfEmployeeMonthly : 0) +
                        parseInt(value.esiEmployeeMonthly)))
                this.changeNumberToCurrencyFormat('netSalaryMonthly', salValue1)

                var salValue2 = (parseInt(
                    parseInt(value.basicSalaryMonthly * 12) +
                    parseInt(value.dearnessAllowanceMonthly * 12) +
                    parseInt(value.houserentAllowanceMonthly * 12) +
                    parseInt((value.pfEmployerMonthly ? value.pfEmployerMonthly : 0) * 12)
                ))
                    -
                    (parseInt(
                        parseInt((value.pfEmployerMonthly ? value.pfEmployerMonthly : 0) * 12) +
                        parseInt((value.pfEmployeeMonthly ? value.pfEmployeeMonthly : 0) * 12) +
                        parseInt((value.esiEmployerMonthly ? value.esiEmployerMonthly : 0) * 12)))
                this.changeNumberToCurrencyFormat('netSalaryYearly', salValue2)

            } else {
                this.props.form.setFieldsValue({
                    netSalaryMonthly: 0,
                    netSalaryYearly: 0
                });
            }


            // If PF and ESI Zero 
            // 3rd block 2nd senario 
            // debugger
            if (value.basicSalaryMonthly
                && value.dearnessAllowanceMonthly
                && value.houserentAllowanceMonthly
                && (value.esiEmployerMonthly==0 && value.pfEmployerMonthly==0)
                && (value.esiEmployeeMonthly==0 && value.pfEmployeeMonthly==0)) {
                var salValue1 = (parseInt(
                    parseInt(value.basicSalaryMonthly) +
                    parseInt(value.dearnessAllowanceMonthly) +
                    parseInt(value.houserentAllowanceMonthly)
                ))
                    -
                    (parseInt(
                        parseInt(value.pfEmployeeMonthly==0 ? value.pfEmployeeMonthly : 0) +
                        parseInt(value.esiEmployeeMonthly==0?value.esiEmployeeMonthly:0)))
                this.changeNumberToCurrencyFormat('netSalaryMonthly', salValue1)

                var salValue2 = (parseInt(
                    parseInt(value.basicSalaryMonthly * 12) +
                    parseInt(value.dearnessAllowanceMonthly * 12) +
                    parseInt(value.houserentAllowanceMonthly * 12) +
                    parseInt((value.pfEmployerMonthly ? value.pfEmployerMonthly : 0) * 12)
                ))
                    -
                    (parseInt(
                        parseInt((value.pfEmployerMonthly==0 ? value.pfEmployerMonthly : 0) * 12) +
                        parseInt((value.pfEmployeeMonthly==0 ? value.pfEmployeeMonthly : 0) * 12) +
                        parseInt((value.esiEmployerMonthly==0 ? value.esiEmployerMonthly : 0) * 12)))
                this.changeNumberToCurrencyFormat('netSalaryYearly', salValue2)

            }

        }
    };

    generateAppointmentLetter = () => {
        var file = new FormData();
        var pdf = new File([" "], "filename.pdf", {
            type: "text/plain",
            lastModified: new Date()
        });
        file.append("files", pdf);
        const employeeId = this.empId;
        this.setState({
            sumbit_APL_Btn: true
        });

        GenericApiService.saveformdata(
            UrlConstant.autoUploadDocument
            + employeeId +
            "&documentCode=" +
            UrlConstant.appointmentLetterCode,
            file,
            true
        ).then(response => {
            this.setState({
                sumbit_APL_Btn: false
            });
            console.log(response);
            if (response.status.success == "Success") {
                // setTimeout(() => {
                //     var doc = new Documents();
                //     doc.getDList(this.orgId,this.empId);
                // }, 1000);
                this.props.changeNextTab("document");
            } else {
            }
        })
            .catch(error => {
                this.setState({
                    sumbit_APL_Btn: false
                });
                console.log(error);
            });
    };

    addSalaryBreakUp = e => {
        e.preventDefault();
        var payload;
        this.props.form.validateFields((formError, values) => {
            if (!formError) {
                values = this.changeFormValuesToNumberFormat();
                payload = {
                    name: this.state.name ? this.state.name : "",
                    description: this.state.description ? this.state.description : "",
                    instaCntDesignationId: this.state.instaCntDesignationId
                        ? this.state.instaCntDesignationId
                        : "",
                    instaCntEemployeeSsalaryDetailId: this.state.salaryId
                        ? this.state.salaryId
                        : "",
                    basicSalaryMonthly: values.basicSalaryMonthly,
                    basicSalaryYearly: values.basicSalaryYearly,
                    dearnessAllowanceMonthly: values.dearnessAllowanceMonthly,
                    dearnessAllowanceYearly: values.dearnessAllowanceYearly,
                    houserentAllowanceMonthly: values.houserentAllowanceMonthly,
                    houserentAllowanceYearly: values.houserentAllowanceYearly,
                    grossSalaryMonthly: values.grossSalaryMonthly,
                    grossSalaryYearly: values.grossSalaryYearly,
                    pfEmployerMonthly: values.pfEmployerMonthly,
                    pfEmployerYearly: values.pfEmployerYearly,
                    esiEmployerMonthly: values.esiEmployerMonthly,
                    esiEmployerYearly: values.esiEmployerYearly,
                    pfEmployeeMonthly: values.pfEmployeeMonthly,
                    pfEmployeeYearly: values.pfEmployeeYearly,
                    esiEmployeeMonthly: values.esiEmployeeMonthly,
                    esiEmployeeYearly: values.esiEmployeeYearly,
                    ctcMonthly: values.ctcMonthly,
                    ctcYearly: values.ctcYearly,
                    totalMonthly: values.totalMonthly,
                    totalYearly: values.totalYearly,
                    netSalaryMonthly: values.netSalaryMonthly,
                    netSalaryYearly: values.netSalaryYearly,
                    cntOrganisationId: this.state.cntOrganisationId
                        ? this.state.cntOrganisationId
                        : this.orgId,
                    isActive: true,
                    createdBy: this.state.createdBy
                        ? this.state.createdBy
                        : parseInt(this.userId),
                    updatedBy: parseInt(this.userId),
                    createdOn: new Date(),
                    updatedOn: new Date(),
                    employeeId: this.employeeId
                };
                this.setState({
                    sumbitBtn: true,
                    AppLetter_Btn: true
                });
                GenericApiService.Post(
                    UrlConstant.saveEmployeeSalary + this.employeeId,
                    payload,
                    true
                )
                    .then(response => {
                        this.setState({
                            sumbitBtn: false,
                        });
                        if (response.status.success == "Success") {
                            this.setState({
                                AppLetter_Btn: false,
                                salaryId: response.data.instaCntEemployeeSsalaryDetailId,
                            });
                        }
                        if (response.status.success == "Fail") {
                        }
                    })
                    .catch(error => {
                        this.setState({
                            sumbitBtn: false,
                        });
                    });
            }
        });
    };

    render() {
        function hasErrors(fieldsError) {
            return Object.keys(fieldsError).some(field => fieldsError[field]);
        }
        const { getFieldDecorator, getFieldsError } = this.props.form;
        const { handlenumberKeyPress } = Directives;
        return (
            <div className="form-container">
                <form>
                    <div className="row emp-salary-break">
                        <div className="row col-lg-12">
                            <div className="col-lg-4 mb-2 header-color">Salary Particulars</div>
                            {/* <div className="col-lg-4 mb-2  ">Per Month</div>
                            <div className="col-lg-4 mb-2  ">Per Year</div> 
                            formatter={value => value.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                            parser={value => value.replace(/\₹\s?|(,*)/g, '')}  */}
                        </div>
                        <div className="row salary-particular align-items-center">
                            <div className="col-lg-4 mb-2  ">Basic Salary :</div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("basicSalaryMonthly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            name="basicSalaryMonthly"
                                            className="ant-input w-100 salary-input"
                                            id="bsPerMonth"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                            placeholder="Per Month"
                                            onKeyUp={this.getTotalGrossSalary}
                                        />

                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("basicSalaryYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            type="text"
                                            id="bsPeryear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>

                            <div className="col-lg-4 mb-2  ">Dearness Allowance :</div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("dearnessAllowanceMonthly", {
                                        rules: [
                                            {
                                                required: true,
                                                message: "This field is required"
                                            }
                                        ]
                                    })(
                                        <Input
                                            name="dearnessAllowanceMonthly"
                                            className="ant-input w-100 salary-input"
                                            id="daPerMonth"
                                            placeholder="Per Month"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                            onKeyUp={this.getTotalGrossSalary}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("dearnessAllowanceYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="daPeryear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>

                            <div className="col-lg-4 mb-2  ">House Rent Allowance :</div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("houserentAllowanceMonthly", {
                                        rules: [
                                            {
                                                required: true,
                                                message: "This field is required"
                                            }
                                        ]
                                    })(
                                        <Input
                                            name="houserentAllowanceMonthly"
                                            className="ant-input w-100 salary-input"
                                            id="hraPerMonth"
                                            placeholder="Per Month"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                            onKeyUp={this.getTotalGrossSalary}
                                        />
                                    )}
                                </Form.Item>

                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("houserentAllowanceYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="hraPeryear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>

                            <div className="col-lg-4 mb-2">
                                <span className="font-weight-bold">GROSS SALARY :</span></div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("grossSalaryMonthly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="csPerMonth"
                                            placeholder="Per Month"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("grossSalaryYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="csPeryear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                        </div>

                        <div className="col-lg-12 mb-2 header-color">Employer Contribution</div>
                        <div className="row salary-particular align-items-center">
                            <div className="col-lg-4 mb-2  ">Provident Fund :</div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("pfEmployerMonthly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            name="pfEmployerMonthly"
                                            className="ant-input w-100 salary-input"
                                            onKeyPress={handlenumberKeyPress}
                                            placeholder="Per Month"
                                            maxLength={9}
                                            onKeyUp={this.getTotalGrossSalary}
                                            id="pfPerMonth"
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("pfEmployerYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="pfPerYear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2  "> ESI :</div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("esiEmployerMonthly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            name="esiEmployerMonthly"
                                            className="ant-input w-100 salary-input"
                                            onKeyPress={handlenumberKeyPress}
                                            placeholder="Per Month"
                                            maxLength={9}
                                            onKeyUp={this.getTotalGrossSalary}
                                            id="pfPerMonth"
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("esiEmployerYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="pfPerYear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="font-weight-bold">COST TO COMPANY (CTC) :</span></div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("ctcMonthly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            name="ctcMonthly"
                                            className="ant-input w-100 salary-input"
                                            id="ctcPerMonth"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                            onKeyUp={this.getTotalGrossSalary}
                                            placeholder="Per Month"
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("ctcYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="ctcPerYear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                        </div>

                        <div className="col-lg-12 mb-2 header-color">Employee Contribution </div>
                        <div className="row salary-particular align-items-center">
                            <div className="col-lg-4 mb-2  ">Provident Fund :</div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("pfEmployeeMonthly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            name="pfEmployeeMonthly"
                                            className="ant-input w-100 salary-input"
                                            id="pfPerMonth"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                            onKeyUp={this.getTotalGrossSalary}
                                            placeholder="Per Month"
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("pfEmployeeYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="pfPerYear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2  "> ESI :</div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("esiEmployeeMonthly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            name="esiEmployeeMonthly"
                                            className="ant-input w-100 salary-input"
                                            id="pfPerMonth"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                            onKeyUp={this.getTotalGrossSalary}
                                            placeholder="Per Month"
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("esiEmployeeYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="pfPerYear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>

                            <div className="col-lg-4 mb-2  ">Total :</div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("totalMonthly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="ctcPerMonth"
                                            placeholder="Per Month"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("totalYearly", {
                                        rules: [
                                            { required: true, message: "This field is required" }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="ctcPerYear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2  ">
                                <span className="font-weight-bold">NET SALARY :</span>
                                <br />
                                <sub>(Gross Salary - Employee Contribution)</sub>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("netSalaryMonthly", {
                                        rules: [
                                            {
                                                required: true,
                                                message: "This field is required"
                                            }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}

                                            id="empcPerMonth"
                                            placeholder="Per Month"
                                        />
                                    )}
                                </Form.Item>
                            </div>
                            <div className="col-lg-4 mb-2">
                                <span className="currency-symbol">₹</span>
                                <Form.Item>
                                    {getFieldDecorator("netSalaryYearly", {
                                        rules: [
                                            {
                                                required: true,
                                                message: "This field is required"
                                            }
                                        ]
                                    })(
                                        <Input
                                            disabled
                                            className="ant-input w-100 salary-input"
                                            id="empcPerYear"
                                            placeholder="Per Year"
                                            onKeyPress={handlenumberKeyPress}
                                            maxLength={9}
                                        />
                                    )}
                                </Form.Item>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <Link to="/home/dashboard">
                                <Button className="cancel-btn mr-4" shape="round">
                                    cancel
                                </Button>
                            </Link>
                            <Button
                                type="primary"
                                shape="round"
                                className="login-btn"
                                onClick={this.addSalaryBreakUp}
                                loading={this.state.sumbitBtn}
                                disabled={hasErrors(getFieldsError())}
                            >
                                {this.state.salaryId ? 'Update' : "Add"}
                            </Button>
                            <Button
                                className="btn-with-icon ml-4"
                                type="primary"
                                shape="round"
                                icon="file-text"
                                onClick={this.generateAppointmentLetter}
                                loading={this.state.sumbit_APL_Btn}
                                disabled={this.state.AppLetter_Btn}
                            >Generate Appointment Letter  </Button>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
}

const WrappedEmpSalaryForm = Form.create({ name: "AddSalaryBreakUp" })(
    AddSalaryBreakUp
);

export default WrappedEmpSalaryForm;
